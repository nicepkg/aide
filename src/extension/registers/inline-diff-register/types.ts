import type { Range, Uri } from 'vscode'

export enum InlineDiffTaskState {
  Idle = 'Idle',
  Applying = 'Applying',
  Rejected = 'Rejected',
  Finished = 'Finished',
  Error = 'Error',
  Pending = 'Pending'
}

export interface DiffBlock {
  id: string
  type: 'add' | 'remove' | 'no-change'
  oldStart: number
  oldLines: string[]
  newStart: number
  newLines: string[]
}

export interface InlineDiffTask {
  id: string
  state: InlineDiffTaskState
  selectionRange: Range
  selectionContent: string
  contentAfterSelection: string
  replacementContent: string
  originalFileUri: Uri
  diffBlocks: DiffBlock[]
  abortController?: AbortController
  error?: Error

  lastKnownDocumentVersion: number
  appliedEdits: {
    actionId: string
    blockId: string
    editType: 'accept' | 'reject'
    range: Range
    oldText: string
    newText: string
  }[]
  waitForReviewDiffBlockIds: string[]
}
