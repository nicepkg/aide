import { EventEmitter } from 'events'

export interface ProgressInfo {
  processedItems: number
  totalItems: number
}

export class ProgressReporter extends EventEmitter {
  private totalItems: number = 0

  private processedItems: number = 0

  private isCompleted: boolean = false

  setTotalItems(total: number) {
    this.totalItems = total
    this.emitProgress()
  }

  incrementProcessedItems(increment: number = 1) {
    this.processedItems += increment
    this.checkCompletion()
    this.emitProgress()
  }

  setProcessedItems(processed: number) {
    this.processedItems = processed
    this.checkCompletion()
    this.emitProgress()
  }

  private checkCompletion() {
    if (this.processedItems >= this.totalItems && !this.isCompleted) {
      this.isCompleted = true
      this.emit('completed')
    }
  }

  private emitProgress() {
    this.emit('progress', this.getProgress())
  }

  private getProgress(): ProgressInfo {
    return {
      processedItems: this.processedItems,
      totalItems: this.totalItems
    }
  }

  async *getProgressIterator(): AsyncIterableIterator<ProgressInfo> {
    while (!this.isCompleted) {
      yield new Promise<ProgressInfo>(resolve => {
        const onProgress = (progress: ProgressInfo) => {
          resolve(progress)
          this.removeListener('progress', onProgress)
        }
        this.on('progress', onProgress)
      })
    }
  }

  reset() {
    this.totalItems = 0
    this.processedItems = 0
    this.isCompleted = false
  }

  dispose() {
    this.removeAllListeners()
  }
}
