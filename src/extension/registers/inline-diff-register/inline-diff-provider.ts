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
import * as vscode from 'vscode'

import {
  InlineDiffTaskState,
  type DiffBlock,
  type InlineDiffTask
} from './types'

export class InlineDiffProvider implements vscode.CodeLensProvider {
  private diffDecorationTypes: {
    add: vscode.TextEditorDecorationType
    remove: vscode.TextEditorDecorationType
    scanning: vscode.TextEditorDecorationType
  }

  private codeLensEventEmitter = new vscode.EventEmitter<void>()

  private tasks: Map<string, InlineDiffTask> = new Map()

  private taskStateChangeEmitter = new vscode.EventEmitter<InlineDiffTask>()

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

    const task: InlineDiffTask = {
      id: taskId,
      state: InlineDiffTaskState.Idle,
      selectionRange: selection,
      selectionContent,
      replacementContent,
      originalFileUri: fileUri,
      diffBlocks: [],
      abortController
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

      for await (const chunk of this.processStreamChunks(aiStream)) {
        accumulatedContent += chunk
        task.replacementContent = getGeneratedFullLinesContent(
          removeCodeBlockStartSyntax(accumulatedContent)
        )

        await this.computeDiff(task)
        this.updateDecorations(task)
        this.codeLensEventEmitter.fire()
        await runScanningDecoration()

        yield task
      }

      task.replacementContent = removeCodeBlockSyntax(
        removeCodeBlockEndSyntax(task.replacementContent)
      )

      await this.computeDiff(task)
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
    const diff = diffLines(task.selectionContent, task.replacementContent)
    task.diffBlocks = []

    let oldLineNum = task.selectionRange.start.line
    let newLineNum = task.selectionRange.start.line

    diff.forEach(part => {
      if (part.added) {
        task.diffBlocks.push({
          oldStart: oldLineNum,
          oldLines: [],
          newStart: newLineNum,
          newLines: part.value.split('\n').filter(line => line.length > 0),
          type: 'add'
        })
        newLineNum += part.count || 0
      } else if (part.removed) {
        task.diffBlocks.push({
          oldStart: oldLineNum,
          oldLines: part.value.split('\n').filter(line => line.length > 0),
          newStart: newLineNum,
          newLines: [],
          type: 'remove'
        })
        oldLineNum += part.count || 0
      } else {
        oldLineNum += part.count || 0
        newLineNum += part.count || 0
      }
    })
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

    task.diffBlocks.forEach(block => {
      if (block.type === 'add') {
        const range = new vscode.Range(
          block.newStart,
          0,
          block.newStart + block.newLines.length - 1,
          block.newLines[block.newLines.length - 1]?.length || 0
        )
        addRanges.push(range)
      } else if (block.type === 'remove') {
        const range = new vscode.Range(
          block.oldStart,
          0,
          block.oldStart + block.oldLines.length - 1,
          block.oldLines[block.oldLines.length - 1]?.length || 0
        )
        removeRanges.push(range)
      }
    })

    editor.setDecorations(this.diffDecorationTypes.add, addRanges)
    editor.setDecorations(this.diffDecorationTypes.remove, removeRanges)
  }

  public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const codeLenses: vscode.CodeLens[] = []

    for (const task of this.tasks.values()) {
      if (
        document.uri.toString() !== task.originalFileUri.toString() ||
        task.state === InlineDiffTaskState.Finished ||
        task.state === InlineDiffTaskState.Rejected
      ) {
        continue
      }

      const topRange = new vscode.Range(
        task.selectionRange.start,
        task.selectionRange.start
      )

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
            arguments: [task]
          })
        )

        codeLenses.push(
          new vscode.CodeLens(topRange, {
            title: '$(x) Reject All',
            command: 'aide.inlineDiff.rejectAll',
            arguments: [task]
          })
        )

        task.diffBlocks.forEach(block => {
          const range = new vscode.Range(
            block.type === 'add' ? block.newStart : block.oldStart,
            0,
            block.type === 'add' ? block.newStart : block.oldStart,
            0
          )

          codeLenses.push(
            new vscode.CodeLens(range, {
              title: '$(check) Accept',
              command: 'aide.inlineDiff.accept',
              arguments: [task, block]
            })
          )

          codeLenses.push(
            new vscode.CodeLens(range, {
              title: '$(x) Reject',
              command: 'aide.inlineDiff.reject',
              arguments: [task, block]
            })
          )
        })
      }
    }

    return codeLenses
  }

  public async acceptDiff(task: InlineDiffTask, block: DiffBlock) {
    const editor = await this.getEditor(task)

    if (block.type === 'add') {
      await editor.edit(editBuilder => {
        const range = new vscode.Range(
          block.newStart,
          0,
          block.newStart + block.newLines.length - 1,
          block.newLines[block.newLines.length - 1]?.length || 0
        )
        editBuilder.delete(range)
      })
    } else if (block.type === 'remove') {
      await editor.edit(editBuilder => {
        const position = new vscode.Position(block.oldStart, 0)
        editBuilder.insert(position, `${block.oldLines.join('\n')}\n`)
      })
    }

    task.diffBlocks = task.diffBlocks.filter(b => b !== block)

    if (task.diffBlocks.length === 0) {
      task.state = InlineDiffTaskState.Finished
      this.taskStateChangeEmitter.fire(task)
    }

    await this.updateDecorations(task)
    this.codeLensEventEmitter.fire()
  }

  public async rejectDiff(task: InlineDiffTask, block: DiffBlock) {
    task.diffBlocks = task.diffBlocks.filter(b => b !== block)

    if (task.diffBlocks.length === 0) {
      task.state = InlineDiffTaskState.Rejected
      this.taskStateChangeEmitter.fire(task)
    }

    await this.updateDecorations(task)
    this.codeLensEventEmitter.fire()
  }

  public async acceptAll(task: InlineDiffTask) {
    for (const block of [...task.diffBlocks].reverse()) {
      await this.acceptDiff(task, block)
    }

    task.state = InlineDiffTaskState.Finished
    this.taskStateChangeEmitter.fire(task)
  }

  public async rejectAll(task: InlineDiffTask) {
    task.diffBlocks = []
    task.state = InlineDiffTaskState.Rejected
    this.taskStateChangeEmitter.fire(task)
    await this.updateDecorations(task)
    this.codeLensEventEmitter.fire()
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
  }
}
