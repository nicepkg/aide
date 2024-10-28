import type { AIMessageChunk } from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'
import { v4 as uuidv4 } from 'uuid'
import * as vscode from 'vscode'

import { DecorationManager } from './decoration-manager'
import { DiffProcessor } from './diff-processor'
import { TaskManager } from './task-manager'
import {
  InlineDiffTaskState,
  type DiffBlock,
  type InlineDiffTask
} from './types'

export class InlineDiffProvider implements vscode.CodeLensProvider {
  private taskManager: TaskManager

  private diffProcessor: DiffProcessor

  private decorationManager: DecorationManager

  private codeLensEventEmitter: vscode.EventEmitter<void>

  constructor() {
    this.diffProcessor = new DiffProcessor()
    this.decorationManager = new DecorationManager(this.diffProcessor)
    this.taskManager = new TaskManager(
      this.diffProcessor,
      this.decorationManager
    )
    this.codeLensEventEmitter = this.taskManager.codeLensChangeEmitter
  }

  get onDidChangeCodeLenses(): vscode.Event<void> {
    return this.codeLensEventEmitter.event
  }

  get onDidChangeTaskState(): vscode.Event<InlineDiffTask> {
    return this.taskManager.onDidChangeTaskState
  }

  async createTask(
    taskId: string,
    fileUri: vscode.Uri,
    selection: vscode.Range,
    replacementContent: string,
    abortController?: AbortController
  ): Promise<InlineDiffTask> {
    return this.taskManager.createTask(
      taskId,
      fileUri,
      selection,
      replacementContent,
      abortController
    )
  }

  async startTask(taskId: string): Promise<void> {
    await this.taskManager.startTask(taskId)
  }

  async *startStreamTask(
    taskId: string,
    buildAiStream: (
      abortController: AbortController
    ) => Promise<IterableReadableStream<AIMessageChunk>>
  ): AsyncGenerator<InlineDiffTask> {
    yield* this.taskManager.startStreamTask(taskId, buildAiStream)
  }

  async provideCodeLenses(
    document: vscode.TextDocument
  ): Promise<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = []

    for (const task of this.taskManager.getAllTasks()) {
      if (
        document.uri.toString() !== task.originalFileUri.toString() ||
        task.state === InlineDiffTaskState.Finished ||
        task.state === InlineDiffTaskState.Rejected
      ) {
        continue
      }

      const blocksWithRange =
        await this.diffProcessor.getDiffBlocksWithDisplayRange(task)
      const { range: diffRange } = await this.diffProcessor.buildDiffContent(
        task,
        blocksWithRange
      )
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

      if (task.state === InlineDiffTaskState.Pending) {
        codeLenses.push(
          new vscode.CodeLens(topRange, {
            title: '$(sync~spin) Aide is working...',
            command: ''
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
          const range = await this.diffProcessor.getDiffBlockDisplayRange(
            blocksWithRange,
            block
          )

          if (isRemoveAddPair) {
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

            i++
          } else if (block.type !== 'no-change') {
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

  async acceptDiffs(
    task: InlineDiffTask,
    blocks: DiffBlock[],
    actionId = uuidv4()
  ) {
    await this.taskManager.acceptDiffs(task, blocks, actionId)
  }

  async rejectDiffs(
    task: InlineDiffTask,
    blocks: DiffBlock[],
    actionId = uuidv4()
  ) {
    await this.taskManager.rejectDiffs(task, blocks, actionId)
  }

  async acceptAll(task: InlineDiffTask, actionId = uuidv4()) {
    await this.acceptDiffs(task, task.diffBlocks, actionId)
    this.taskManager.updateTaskState(task, InlineDiffTaskState.Finished)
  }

  async rejectAll(task: InlineDiffTask, actionId = uuidv4()) {
    await this.rejectDiffs(task, task.diffBlocks, actionId)
    this.taskManager.updateTaskState(task, InlineDiffTaskState.Rejected)
  }

  async resetAndCleanHistory(taskId: string) {
    await this.taskManager.resetAndCleanHistory(taskId)
  }

  dispose() {
    this.codeLensEventEmitter.dispose()
    this.taskManager.dispose()
    this.decorationManager.dispose()
    this.diffProcessor.dispose()
  }
}
