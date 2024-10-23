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
  oldStart: number
  oldLines: string[]
  newStart: number
  newLines: string[]
  type: 'add' | 'remove' | 'modify'
}

export interface InlineDiffTask {
  id: string
  state: InlineDiffTaskState
  selectionRange: Range
  selectionContent: string
  replacementContent: string
  originalFileUri: Uri
  diffBlocks: DiffBlock[]
  abortController?: AbortController
  error?: Error
}
