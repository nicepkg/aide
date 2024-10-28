import { BaseModelProvider } from '@extension/ai/model-providers/base'
import { logger } from '@extension/logger'
import {
  removeCodeBlockEndSyntax,
  removeCodeBlockStartSyntax,
  removeCodeBlockSyntax
} from '@extension/utils'
import type { AIMessageChunk } from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'
import { v4 as uuidv4 } from 'uuid'
import * as vscode from 'vscode'

import { DecorationManager } from './decoration-manager'
import { DiffProcessor } from './diff-processor'
import { HistoryManager } from './history-manager'
import {
  InlineDiffTask,
  InlineDiffTaskState,
  type DiffAction,
  type DiffBlock,
  type DiffBlockWithRange
} from './types'

export class TaskManager {
  private disposes: vscode.Disposable[] = []

  private tasks: Map<string, InlineDiffTask> = new Map()

  private taskStateChangeEmitter = new vscode.EventEmitter<InlineDiffTask>()

  codeLensChangeEmitter = new vscode.EventEmitter<void>()

  get onDidChangeTaskState(): vscode.Event<InlineDiffTask> {
    return this.taskStateChangeEmitter.event
  }

  constructor(
    private diffProcessor: DiffProcessor,
    private decorationManager: DecorationManager
  ) {}

  async createTask(
    taskId: string,
    fileUri: vscode.Uri,
    selection: vscode.Range,
    replacementContent: string,
    abortController?: AbortController
  ): Promise<InlineDiffTask> {
    const document = await vscode.workspace.openTextDocument(fileUri)
    const selectionContent = document.getText(selection)
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
      waitForReviewDiffBlockIds: [],
      history: new HistoryManager()
    }

    this.tasks.set(task.id, task)
    return task
  }

  async startTask(taskId: string) {
    const task = this.getTask(taskId)
    if (!task) throw new Error('Task not found')

    try {
      this.updateTaskState(task, InlineDiffTaskState.Applying)
      await this.diffProcessor.computeDiff(task)

      const blocksWithRange =
        await this.diffProcessor.getDiffBlocksWithDisplayRange(task)
      await this.applyToDocumentAndRefresh(task, blocksWithRange)
      await this.setupDocumentChangeListener(task)
    } catch (error) {
      this.handleTaskError(task, error)
    }
  }

  async *startStreamTask(
    taskId: string,
    buildAiStream: (
      abortController: AbortController
    ) => Promise<IterableReadableStream<AIMessageChunk>>
  ): AsyncGenerator<InlineDiffTask> {
    const task = this.getTask(taskId)
    if (!task) throw new Error('Task not found')

    try {
      this.updateTaskState(task, InlineDiffTaskState.Pending)

      if (!task.abortController) {
        task.abortController = new AbortController()
      }

      const aiStream = await buildAiStream(task.abortController)
      let accumulatedContent = ''

      await this.setupDocumentChangeListener(task)

      for await (const chunk of this.processStreamChunks(aiStream)) {
        accumulatedContent += chunk
        task.replacementContent = this.getGeneratedFullLinesContent(
          removeCodeBlockStartSyntax(accumulatedContent)
        )

        await this.diffProcessor.computeDiff(task)

        const editor = await this.diffProcessor.getEditor(task)

        await this.decorationManager.updateScanningDecoration(editor, task)

        yield task
      }

      task.replacementContent = removeCodeBlockSyntax(
        removeCodeBlockEndSyntax(task.replacementContent)
      )

      this.updateTaskState(task, InlineDiffTaskState.Applying)
      await this.diffProcessor.computeDiff(task)
      const editor = await this.diffProcessor.getEditor(task)
      const blocksWithRange =
        await this.diffProcessor.getDiffBlocksWithDisplayRange(task)
      await this.applyToDocumentAndRefresh(task, blocksWithRange)
      await this.decorationManager.updateScanningDecoration(editor, task, true)

      yield task
    } catch (error) {
      this.handleTaskError(task, error)
      yield task
    } finally {
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

  private getGeneratedFullLinesContent(content: string): string {
    const lines = content.split('\n')
    return lines.slice(0, lines.length - 1).join('\n')
  }

  getTask(taskId: string): InlineDiffTask | undefined {
    return this.tasks.get(taskId)
  }

  getAllTasks(): InlineDiffTask[] {
    return Array.from(this.tasks.values())
  }

  updateTaskState(task: InlineDiffTask, state: InlineDiffTaskState) {
    task.state = state
    this.taskStateChangeEmitter.fire(task)
  }

  private handleTaskError(task: InlineDiffTask, error: unknown) {
    task.state = InlineDiffTaskState.Error
    task.error = error instanceof Error ? error : new Error(String(error))
    this.taskStateChangeEmitter.fire(task)
    logger.error('Error in task', error)
  }

  async resetAndCleanHistory(taskId: string) {
    const task = this.getTask(taskId)
    if (!task) return

    task.abortController?.abort()
    task.history.clear()
    task.waitForReviewDiffBlockIds = []
    task.diffBlocks = []
    task.replacementContent = ''

    this.updateTaskState(task, InlineDiffTaskState.Idle)
    const blocksWithRange =
      await this.diffProcessor.getDiffBlocksWithDisplayRange(task)
    await this.applyToDocumentAndRefresh(task, blocksWithRange)
    await this.updateDecorationsAndCodeLenses(task, blocksWithRange)

    const editor = await this.diffProcessor.getEditor(task)
    editor.edit(editBuilder => {
      editBuilder.replace(task.selectionRange, task.selectionContent)
    })
    editor.document.save()

    this.tasks.delete(taskId)
  }

  async updateDecorationsAndCodeLenses(
    task: InlineDiffTask,
    blocksWithRange: DiffBlockWithRange[]
  ) {
    const editor = await this.diffProcessor.getEditor(task)
    await this.decorationManager.updateDecorations(
      editor,
      task,
      blocksWithRange
    )

    this.codeLensChangeEmitter.fire()
  }

  async applyToDocumentAndRefresh(
    task: InlineDiffTask,
    blocksWithRange: DiffBlockWithRange[]
  ) {
    const { content: renderDiffContent, range: renderDiffRange } =
      await this.diffProcessor.buildDiffContent(task, blocksWithRange)

    await this.diffProcessor.applyDiffToDocument(
      task,
      renderDiffContent,
      renderDiffRange
    )

    await this.updateDecorationsAndCodeLenses(task, blocksWithRange)
  }

  async acceptDiffs(
    task: InlineDiffTask,
    blocks: DiffBlock[],
    actionId = uuidv4()
  ) {
    const action: DiffAction = {
      id: actionId,
      edits: [],
      timestamp: Date.now()
    }

    blocks.forEach(block => {
      if (
        !task.waitForReviewDiffBlockIds.includes(block.id) ||
        block.type === 'no-change'
      )
        return

      task.waitForReviewDiffBlockIds = task.waitForReviewDiffBlockIds.filter(
        id => id !== block.id
      )

      action.edits.push({
        blockId: block.id,
        editType: 'accept'
      })
    })

    task.history.push(action)

    try {
      const blocksWithRange =
        await this.diffProcessor.getDiffBlocksWithDisplayRange(task)
      await this.applyToDocumentAndRefresh(task, blocksWithRange)

      if (task.waitForReviewDiffBlockIds.length === 0) {
        this.updateTaskState(task, InlineDiffTaskState.Finished)
        const editor = await this.diffProcessor.getEditor(task)
        await editor.document.save()
      }
    } catch (error) {
      logger.error('Error accepting diff', error)
      throw error
    }
  }

  async rejectDiffs(
    task: InlineDiffTask,
    blocks: DiffBlock[],
    actionId = uuidv4()
  ) {
    const action: DiffAction = {
      id: actionId,
      edits: [],
      timestamp: Date.now()
    }

    blocks.forEach(block => {
      if (
        !task.waitForReviewDiffBlockIds.includes(block.id) ||
        block.type === 'no-change'
      )
        return

      task.waitForReviewDiffBlockIds = task.waitForReviewDiffBlockIds.filter(
        id => id !== block.id
      )

      action.edits.push({
        blockId: block.id,
        editType: 'reject'
      })
    })

    task.history.push(action)

    try {
      const blocksWithRange =
        await this.diffProcessor.getDiffBlocksWithDisplayRange(task)
      await this.applyToDocumentAndRefresh(task, blocksWithRange)

      if (task.waitForReviewDiffBlockIds.length === 0) {
        this.updateTaskState(task, InlineDiffTaskState.Rejected)
        const editor = await this.diffProcessor.getEditor(task)
        await editor.document.save()
      }
    } catch (error) {
      logger.error('Error rejecting diff', error)
      throw error
    }
  }

  setupDocumentChangeListener(task: InlineDiffTask) {
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

  async handleUndoRedo(
    task: InlineDiffTask,
    event: vscode.TextDocumentChangeEvent
  ) {
    if (task.history.isEmpty) return

    try {
      let action: DiffAction | undefined

      if (event.reason === vscode.TextDocumentChangeReason.Undo) {
        action = task.history.undo()
        if (action) {
          action.edits.forEach(edit => {
            if (!task.waitForReviewDiffBlockIds.includes(edit.blockId)) {
              task.waitForReviewDiffBlockIds.push(edit.blockId)
            }
          })
        }
      } else if (event.reason === vscode.TextDocumentChangeReason.Redo) {
        action = task.history.redo()
        if (action) {
          action.edits.forEach(edit => {
            task.waitForReviewDiffBlockIds =
              task.waitForReviewDiffBlockIds.filter(id => id !== edit.blockId)
          })
        }
      }

      const blocksWithRange =
        await this.diffProcessor.getDiffBlocksWithDisplayRange(task)
      await this.applyToDocumentAndRefresh(task, blocksWithRange)
      await this.updateDecorationsAndCodeLenses(task, blocksWithRange)

      if (task.waitForReviewDiffBlockIds.length === 0) {
        const allAccepted = task.history
          .getEditsUpToCurrent()
          .every(edit => edit.editType === 'accept')

        this.updateTaskState(
          task,
          allAccepted
            ? InlineDiffTaskState.Finished
            : InlineDiffTaskState.Rejected
        )
      } else if (
        task.state === InlineDiffTaskState.Finished ||
        task.state === InlineDiffTaskState.Rejected
      ) {
        this.updateTaskState(task, InlineDiffTaskState.Applying)
      }
    } catch (error) {
      logger.error('Error handling undo/redo', error)
    }
  }

  dispose() {
    this.taskStateChangeEmitter.dispose()
    this.tasks.clear()
    this.diffProcessor.dispose()
    this.decorationManager.dispose()
    this.disposes.forEach(dispose => dispose.dispose())
    this.disposes = []
  }
}
