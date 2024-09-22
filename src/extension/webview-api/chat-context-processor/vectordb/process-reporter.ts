export interface IndexingProgress {
  processedFiles: number
  totalFiles: number
  currentFile: string
}

export type ProgressCallback = (progress: IndexingProgress) => void

export class ProgressReporter {
  private callback?: ProgressCallback

  setCallback(callback: ProgressCallback) {
    this.callback = callback
  }

  report(processedFiles: number, totalFiles: number, currentFile: string) {
    if (this.callback) {
      this.callback({ processedFiles, totalFiles, currentFile })
    }
  }
}
