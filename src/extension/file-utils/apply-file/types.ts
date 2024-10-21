export interface TmpFileYieldedChunk {
  chunk: string
  generatedContent: string
  status: TmpFileStatus
}

export enum TmpFileStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
  ERROR = 'error'
}
