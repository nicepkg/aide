import { BaseModelProvider } from '@extension/ai/model-providers/base'
import { logger } from '@extension/logger'
import {
  removeCodeBlockEndSyntax,
  removeCodeBlockStartSyntax,
  removeCodeBlockSyntax
} from '@extension/utils'
import type { AIMessageChunk } from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'
import { diffLines } from 'diff'
import { v4 as uuidv4 } from 'uuid'
import * as vscode from 'vscode'

import {
  InlineDiffTaskState,
  type DiffBlock,
  type InlineDiffTask
} from './types'

interface DiffBlockWithRange extends DiffBlock {
  displayRange: vscode.Range
  status: 'pending' | 'accept' | 'reject'
  renderedLines: string[] // Actual lines that should be displayed
}
export class InlineDiffProvider implements vscode.CodeLensProvider {
  private diffDecorationTypes: {
    add: vscode.TextEditorDecorationType
    remove: vscode.TextEditorDecorationType
    scanning: vscode.TextEditorDecorationType
  }

  private codeLensEventEmitter = new vscode.EventEmitter<void>()

  private tasks: Map<string, InlineDiffTask> = new Map()

  private taskStateChangeEmitter = new vscode.EventEmitter<InlineDiffTask>()

  private disposes: vscode.Disposable[] = []

  constructor() {
    this.diffDecorationTypes = {
      add: vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor(
          'diffEditor.insertedTextBackground'
        ),
        isWholeLine: true
      }),
      remove: vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor(
          'diffEditor.removedTextBackground'
        ),
        isWholeLine: true
      }),
      scanning: vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor(
          'editor.findMatchHighlightBackground'
        ),
        isWholeLine: true
      })
    }
  }

  get onDidChangeCodeLenses(): vscode.Event<void> {
    return this.codeLensEventEmitter.event
  }

  get onDidChangeTaskState(): vscode.Event<InlineDiffTask> {
    return this.taskStateChangeEmitter.event
  }

  public async createTask(
    taskId: string,
    fileUri: vscode.Uri,
    selection: vscode.Range,
    replacementContent: string,
    abortController?: AbortController
  ): Promise<InlineDiffTask> {
    const document = await vscode.workspace.openTextDocument(fileUri)
    const selectionContent = document.getText(selection)

    // Get content after selection
    const contentAfterSelection = document.getText(
      new vscode.Range(
        selection.end,
        document.lineAt(document.lineCount - 1).range.end
      )
    )

    const task: InlineDiffTask = {
      id: taskId,
      state: InlineDiffTaskState.Idle,
      selectionRange: selection,
      selectionContent,
      contentAfterSelection,
      replacementContent,
      originalFileUri: fileUri,
      diffBlocks: [],
      abortController,
      lastKnownDocumentVersion: document.version,
      appliedEdits: [],
      waitForReviewDiffBlockIds: []
    }

    this.tasks.set(task.id, task)
    return task
  }

  public async startTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error('Task not found')

    try {
      task.state = InlineDiffTaskState.Applying
      this.taskStateChangeEmitter.fire(task)

      await this.computeDiff(task)
      await this.applyDiffToDocument(task)
      await this.setupDocumentChangeListener(task)

      this.updateDecorations(task)
      this.codeLensEventEmitter.fire()
    } catch (error) {
      task.state = InlineDiffTaskState.Error
      task.error = error instanceof Error ? error : new Error(String(error))
      this.taskStateChangeEmitter.fire(task)
      logger.error('Error in inline diff task', error)
      throw error
    }
  }

  public async *startStreamTask(
    taskId: string,
    buildAiStream: (
      abortController: AbortController
    ) => Promise<IterableReadableStream<AIMessageChunk>>
  ): AsyncGenerator<InlineDiffTask> {
    const task = this.tasks.get(taskId)
    if (!task) throw new Error('Task not found')

    const runScanningDecoration = async (isLast = false) => {
      try {
        const editor = await this.getEditor(task)

        if (isLast) {
          editor.setDecorations(this.diffDecorationTypes.scanning, [])
          return
        }

        const lines = task.replacementContent.split('\n')
        const lastLineIndex = task.selectionRange.start.line + lines.length - 1

        const scanningRange = new vscode.Range(
          lastLineIndex,
          0,
          lastLineIndex,
          lines[lines.length - 1]?.length || 0
        )

        editor.setDecorations(this.diffDecorationTypes.scanning, [
          scanningRange
        ])
      } catch (error) {
        logger.error(
          'Error in inline diff stream task runScanningDecoration',
          error
        )
      }
    }

    try {
      task.state = InlineDiffTaskState.Pending
      this.taskStateChangeEmitter.fire(task)

      if (!task.abortController) {
        task.abortController = new AbortController()
      }

      const aiStream = await buildAiStream(task.abortController)
      let accumulatedContent = ''

      const getGeneratedFullLinesContent = (content: string) => {
        const lines = content.split('\n')
        return lines.slice(0, lines.length - 1).join('\n')
      }

      await this.setupDocumentChangeListener(task)

      for await (const chunk of this.processStreamChunks(aiStream)) {
        accumulatedContent += chunk
        task.replacementContent = getGeneratedFullLinesContent(
          removeCodeBlockStartSyntax(accumulatedContent)
        )

        await this.computeDiff(task)
        await this.applyDiffToDocument(task)
        this.updateDecorations(task)
        this.codeLensEventEmitter.fire()
        await runScanningDecoration()

        yield task
      }

      task.replacementContent = removeCodeBlockSyntax(
        removeCodeBlockEndSyntax(task.replacementContent)
      )

      await this.computeDiff(task)
      await this.applyDiffToDocument(task)
      this.updateDecorations(task)
      this.codeLensEventEmitter.fire()

      task.state = InlineDiffTaskState.Applying
      this.taskStateChangeEmitter.fire(task)
      yield task
    } catch (error) {
      task.state = InlineDiffTaskState.Error
      task.error = error instanceof Error ? error : new Error(String(error))
      this.taskStateChangeEmitter.fire(task)
      logger.error('Error in inline diff stream task', error)
      yield task
    } finally {
      await runScanningDecoration(true)
      task.abortController?.abort()
    }
  }

  private async *processStreamChunks(
    aiStream: IterableReadableStream<AIMessageChunk>
  ): AsyncIterableIterator<string> {
    for await (const chunk of aiStream) {
      yield BaseModelProvider.answerContentToText(chunk.content)
    }
  }

  private async computeDiff(task: InlineDiffTask) {
    // Get line by line diff
    const diffResult = diffLines(task.selectionContent, task.replacementContent)

    let oldLineCount = 0
    let newLineCount = 0

    task.diffBlocks = diffResult.map(part => {
      const block: DiffBlock = {
        id: uuidv4(),
        oldStart: oldLineCount,
        newStart: newLineCount,
        oldLines: [],
        newLines: [],
        type: 'no-change'
      }

      // Process each part of the content, ensuring correct handling of newlines
      const processContent = (content: string) => {
        if (!content) return []
        const lines = content.split('\n')

        // If the last character is a newline, the last line of lines is an empty string
        if (lines[lines.length - 1] === '') {
          lines.pop()
        }

        return lines
      }

      if (part.added) {
        block.type = 'add'
        block.newLines = processContent(part.value)
        block.oldLines = []
        newLineCount += block.newLines.length
      } else if (part.removed) {
        block.type = 'remove'
        block.oldLines = processContent(part.value)
        block.newLines = []
        oldLineCount += block.oldLines.length
      } else {
        block.type = 'no-change'
        block.oldLines = processContent(part.value)
        block.newLines = [...block.oldLines]
        oldLineCount += block.oldLines.length
        newLineCount += block.newLines.length
      }

      return block
    })

    // Filter out empty diff blocks
    task.diffBlocks = task.diffBlocks.filter(block => {
      if (block.type === 'add') {
        return block.newLines.length > 0
      }
      if (block.type === 'remove') {
        return block.oldLines.length > 0
      }
      return block.oldLines.length > 0
    })

    // All non-no-change blocks need to be reviewed in the initial state
    task.waitForReviewDiffBlockIds = task.diffBlocks
      .filter(block => block.type !== 'no-change')
      .map(block => block.id)
  }

  private async getDiffBlocksWithDisplayRange(
    task: InlineDiffTask
  ): Promise<DiffBlockWithRange[]> {
    const baseStartLine = task.selectionRange.start.line
    const blocksWithRange: DiffBlockWithRange[] = []
    let totalOffset = 0

    for (const block of task.diffBlocks) {
      const edit = task.appliedEdits.find(e => e.blockId === block.id)
      const status = edit ? edit.editType : 'pending'
      const startLine = baseStartLine + block.oldStart + totalOffset
      let renderedLines: string[] = []

      switch (block.type) {
        case 'remove': {
          renderedLines = status === 'accept' ? [] : block.oldLines
          status === 'reject' && (totalOffset += block.oldLines.length)
          break
        }

        case 'add': {
          renderedLines = status === 'reject' ? [] : block.newLines
          status === 'reject' && (totalOffset -= block.newLines.length)
          break
        }

        case 'no-change': {
          renderedLines = block.oldLines
          break
        }

        default: {
          throw new Error('Unknown block type')
        }
      }

      // Modify: Use the length of effectiveLines directly to calculate the range
      const range = new vscode.Range(
        startLine,
        0,
        startLine + (renderedLines.length || 1) - 1,
        Number.MAX_SAFE_INTEGER
      )

      blocksWithRange.push({
        ...block,
        displayRange: range,
        status,
        renderedLines
      })
    }

    // Handle overlapping blocks
    for (let i = 1; i < blocksWithRange.length; i++) {
      const getPrevDisplayBlock = (
        index: number
      ): DiffBlockWithRange | undefined => {
        if (index < 0) return
        const block = blocksWithRange[index]!
        if (block.renderedLines.length === 0)
          return getPrevDisplayBlock(index - 1)
        return block
      }

      const prevDisplayBlock = getPrevDisplayBlock(i - 1)
      if (!prevDisplayBlock) continue

      const currBlock = blocksWithRange[i]!

      if (
        currBlock.displayRange.start.line <=
        prevDisplayBlock.displayRange.end.line
      ) {
        const newStart = prevDisplayBlock.displayRange.end.line + 1
        const blockLength = currBlock.renderedLines.length
        currBlock.displayRange = new vscode.Range(
          newStart,
          0,
          newStart + (blockLength || 1) - 1,
          Number.MAX_SAFE_INTEGER
        )
      }
    }

    return blocksWithRange
  }

  private async getDiffBlockDisplayRange(
    task: InlineDiffTask,
    block: DiffBlock
  ): Promise<vscode.Range> {
    const blocks = await this.getDiffBlocksWithDisplayRange(task)
    const targetBlock = blocks.find(b => b.id === block.id)
    if (!targetBlock) {
      throw new Error('Block not found')
    }
    return targetBlock.displayRange
  }

  private async buildDiffContent(
    task: InlineDiffTask
  ): Promise<{ content: string; range: vscode.Range }> {
    const editor = await this.getEditor(task)
    const { document } = editor
    const blocks = await this.getDiffBlocksWithDisplayRange(task)

    let content = ''
    const startLine = task.selectionRange.start.line
    let endLine = startLine

    blocks.forEach((block, index) => {
      if (block.renderedLines.length === 0) {
        return
      }

      endLine = Math.max(endLine, block.displayRange.end.line)
      content += block.renderedLines.join('\n')

      if (
        index < blocks.length - 1 &&
        blocks.slice(index + 1).some(b => b.renderedLines.length > 0)
      ) {
        content += '\n'
      }
    })

    // Add content after selection
    if (task.contentAfterSelection) {
      content += `\n${task.contentAfterSelection}`
    }

    const range = new vscode.Range(
      startLine,
      0,
      task.contentAfterSelection ? document.lineCount - 1 : endLine,
      Number.MAX_SAFE_INTEGER
    )

    return { content, range }
  }

  private async applyDiffToDocument(task: InlineDiffTask) {
    const editor = await this.getEditor(task)
    const { content: diffContent, range: diffRange } =
      await this.buildDiffContent(task)

    const currentContent = editor.document.getText(diffRange)
    if (currentContent === diffContent) {
      return
    }
    const currentEndLine = editor.document.lineCount - 1
    const currentEndLineTextLength =
      editor.document.lineAt(currentEndLine).text.length

    try {
      await editor.edit(editBuilder => {
        editBuilder.replace(diffRange, diffContent)

        if (diffRange.end.line < currentEndLine) {
          const extraLinesRange = new vscode.Range(
            diffRange.end.line + 1,
            0,
            currentEndLine,
            currentEndLineTextLength
          )
          editBuilder.delete(extraLinesRange)
        }
      })

      task.lastKnownDocumentVersion = editor.document.version
    } catch (error) {
      logger.error('Error applying diff to document', error)
      throw error
    }
  }

  private setupDocumentChangeListener(task: InlineDiffTask) {
    this.disposes.push(
      vscode.workspace.onDidChangeTextDocument(async e => {
        if (e.document.uri.toString() !== task.originalFileUri.toString()) {
          return
        }

        const isUndoRedo =
          e.reason === vscode.TextDocumentChangeReason.Undo ||
          e.reason === vscode.TextDocumentChangeReason.Redo

        if (isUndoRedo) {
          await this.handleUndoRedo(task, e)
        }

        task.lastKnownDocumentVersion = e.document.version
      })
    )
  }

  private async handleUndoRedo(
    task: InlineDiffTask,
    event: vscode.TextDocumentChangeEvent
  ) {
    if (task.appliedEdits.length === 0) return

    try {
      if (event.reason === vscode.TextDocumentChangeReason.Undo) {
        // Find all edits with the last actionId
        const lastEdit = task.appliedEdits[task.appliedEdits.length - 1]!
        const lastActionId = lastEdit.actionId

        // Remove all edits with the same actionId
        const editsToRemove = task.appliedEdits.filter(
          edit => edit.actionId === lastActionId
        )
        task.appliedEdits = task.appliedEdits.filter(
          edit => edit.actionId !== lastActionId
        )

        // Add these edit blockIds back to review list
        editsToRemove.forEach(edit => {
          if (!task.waitForReviewDiffBlockIds.includes(edit.blockId)) {
            task.waitForReviewDiffBlockIds.push(edit.blockId)
          }
        })
      }

      // Recalculate and apply the entire diff content
      const { content: diffContent, range: diffRange } =
        await this.buildDiffContent(task)
      const editor = await this.getEditor(task)

      await editor.edit(editBuilder => {
        editBuilder.replace(diffRange, diffContent)
      })

      await this.updateDecorations(task)
      this.codeLensEventEmitter.fire()

      // Update task state
      if (task.waitForReviewDiffBlockIds.length === 0) {
        const allAccepted = task.appliedEdits.every(
          edit => edit.editType === 'accept'
        )
        task.state = allAccepted
          ? InlineDiffTaskState.Finished
          : InlineDiffTaskState.Rejected
        this.taskStateChangeEmitter.fire(task)
      } else if (
        task.state === InlineDiffTaskState.Finished ||
        task.state === InlineDiffTaskState.Rejected
      ) {
        task.state = InlineDiffTaskState.Applying
        this.taskStateChangeEmitter.fire(task)
      }
    } catch (error) {
      logger.error('Error handling undo/redo', error)
    }
  }

  private async getEditor(task: InlineDiffTask) {
    const document = await vscode.workspace.openTextDocument(
      task.originalFileUri
    )
    return await vscode.window.showTextDocument(document)
  }

  private async updateDecorations(task: InlineDiffTask) {
    const editor = await this.getEditor(task)

    const addRanges: vscode.Range[] = []
    const removeRanges: vscode.Range[] = []

    await Promise.all(
      task.diffBlocks.map(async block => {
        if (!task.waitForReviewDiffBlockIds.includes(block.id)) {
          return
        }

        if (block.type === 'add') {
          const range = await this.getDiffBlockDisplayRange(task, block)
          addRanges.push(range)
        } else if (block.type === 'remove') {
          const range = await this.getDiffBlockDisplayRange(task, block)
          removeRanges.push(range)
        }
      })
    )

    editor.setDecorations(this.diffDecorationTypes.add, addRanges)
    editor.setDecorations(this.diffDecorationTypes.remove, removeRanges)
  }

  public async provideCodeLenses(
    document: vscode.TextDocument
  ): Promise<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = []

    for (const task of this.tasks.values()) {
      if (
        document.uri.toString() !== task.originalFileUri.toString() ||
        task.state === InlineDiffTaskState.Finished ||
        task.state === InlineDiffTaskState.Rejected
      ) {
        continue
      }

      const { range: diffRange } = await this.buildDiffContent(task)
      const topRange = new vscode.Range(
        new vscode.Position(diffRange.start.line, 0),
        new vscode.Position(diffRange.start.line, 0)
      )
      const actionId = uuidv4()

      if (task.state === InlineDiffTaskState.Error) {
        codeLenses.push(
          new vscode.CodeLens(topRange, {
            title: `$(error) Error applying diff`,
            command: 'aide.inlineDiff.showError',
            arguments: [task]
          })
        )
        continue
      }

      if (task.state === InlineDiffTaskState.Applying) {
        codeLenses.push(
          new vscode.CodeLens(topRange, {
            title: '$(check) Accept All',
            command: 'aide.inlineDiff.acceptAll',
            arguments: [task, actionId]
          })
        )

        codeLenses.push(
          new vscode.CodeLens(topRange, {
            title: '$(x) Reject All',
            command: 'aide.inlineDiff.rejectAll',
            arguments: [task, actionId]
          })
        )

        // Modify logic for handling single block
        for (let i = 0; i < task.diffBlocks.length; i++) {
          const block = task.diffBlocks[i]!
          if (!task.waitForReviewDiffBlockIds.includes(block.id)) {
            continue
          }

          const nextBlock = task.diffBlocks[i + 1]
          const isRemoveAddPair =
            block.type === 'remove' &&
            nextBlock?.type === 'add' &&
            task.waitForReviewDiffBlockIds.includes(nextBlock.id)

          const range = await this.getDiffBlockDisplayRange(task, block)

          if (isRemoveAddPair) {
            // For remove-add pairs, only add buttons on remove block, but pass both blocks
            codeLenses.push(
              new vscode.CodeLens(range, {
                title: '$(check) Accept',
                command: 'aide.inlineDiff.accept',
                arguments: [task, [block, nextBlock], actionId]
              })
            )

            codeLenses.push(
              new vscode.CodeLens(range, {
                title: '$(x) Reject',
                command: 'aide.inlineDiff.reject',
                arguments: [task, [block, nextBlock], actionId]
              })
            )

            // Skip next add block
            i++
          } else if (block.type !== 'no-change') {
            // For other types of blocks, keep original logic
            codeLenses.push(
              new vscode.CodeLens(range, {
                title: '$(check) Accept',
                command: 'aide.inlineDiff.accept',
                arguments: [task, [block], actionId]
              })
            )

            codeLenses.push(
              new vscode.CodeLens(range, {
                title: '$(x) Reject',
                command: 'aide.inlineDiff.reject',
                arguments: [task, [block], actionId]
              })
            )
          }
        }
      }
    }

    return codeLenses
  }

  public async acceptDiffs(
    task: InlineDiffTask,
    blocks: DiffBlock[],
    actionId = uuidv4()
  ) {
    await Promise.all(
      blocks
        .filter(
          block =>
            task.waitForReviewDiffBlockIds.includes(block.id) &&
            block.type !== 'no-change'
        )
        .map(async block => {
          const range = await this.getDiffBlockDisplayRange(task, block)
          let newText = ''
          let oldText = ''

          if (block.type === 'add') {
            oldText = ''
            // Remove extra newlines
            newText = block.newLines.join('\n')
          } else if (block.type === 'remove') {
            // Remove extra newlines
            oldText = block.oldLines.join('\n')
            newText = ''
          }

          try {
            task.appliedEdits.push({
              actionId,
              blockId: block.id,
              editType: 'accept',
              range,
              oldText,
              newText
            })

            task.waitForReviewDiffBlockIds =
              task.waitForReviewDiffBlockIds.filter(id => id !== block.id)

            await this.applyDiffToDocument(task)

            if (task.waitForReviewDiffBlockIds.length === 0) {
              task.state = InlineDiffTaskState.Finished
              this.taskStateChangeEmitter.fire(task)
            }

            await this.updateDecorations(task)
            this.codeLensEventEmitter.fire()
          } catch (error) {
            logger.error('Error accepting diff', error)
            throw error
          }
        })
    )
  }

  public async rejectDiffs(
    task: InlineDiffTask,
    blocks: DiffBlock[],
    actionId = uuidv4()
  ) {
    await Promise.all(
      blocks
        .filter(
          block =>
            task.waitForReviewDiffBlockIds.includes(block.id) &&
            block.type !== 'no-change'
        )
        .map(async block => {
          const range = await this.getDiffBlockDisplayRange(task, block)
          let newText = ''
          let oldText = ''

          if (block.type === 'add') {
            // Remove extra newlines
            oldText = block.newLines.join('\n')
            newText = ''
          } else if (block.type === 'remove') {
            // Remove extra newlines
            oldText = ''
            newText = block.oldLines.join('\n')
          }

          try {
            task.appliedEdits.push({
              actionId,
              blockId: block.id,
              editType: 'reject',
              range,
              oldText,
              newText
            })

            task.waitForReviewDiffBlockIds =
              task.waitForReviewDiffBlockIds.filter(id => id !== block.id)

            await this.applyDiffToDocument(task)

            if (task.waitForReviewDiffBlockIds.length === 0) {
              task.state = InlineDiffTaskState.Rejected
              this.taskStateChangeEmitter.fire(task)
            }

            await this.updateDecorations(task)
            this.codeLensEventEmitter.fire()
          } catch (error) {
            logger.error('Error rejecting diff', error)
            throw error
          }
        })
    )
  }

  public async acceptAll(task: InlineDiffTask, actionId = uuidv4()) {
    await this.acceptDiffs(task, task.diffBlocks, actionId)
    task.state = InlineDiffTaskState.Finished
    this.taskStateChangeEmitter.fire(task)
  }

  public async rejectAll(task: InlineDiffTask, actionId = uuidv4()) {
    await this.rejectDiffs(task, task.diffBlocks, actionId)
    task.state = InlineDiffTaskState.Rejected
    this.taskStateChangeEmitter.fire(task)
  }

  public async cancelAndRemoveTask(taskId: string) {
    const task = this.tasks.get(taskId)
    if (!task) return

    task.abortController?.abort()
    task.diffBlocks = []

    await this.updateDecorations(task)

    task.state = InlineDiffTaskState.Idle
    this.taskStateChangeEmitter.fire(task)
    this.tasks.delete(taskId)
  }

  public dispose() {
    this.diffDecorationTypes.add.dispose()
    this.diffDecorationTypes.remove.dispose()
    this.diffDecorationTypes.scanning.dispose()
    this.codeLensEventEmitter.dispose()
    this.taskStateChangeEmitter.dispose()
    this.disposes.forEach(dispose => dispose.dispose())
    this.disposes = []
  }
}
