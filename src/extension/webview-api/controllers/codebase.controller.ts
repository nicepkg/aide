import { CodebaseWatcherRegister } from '@extension/registers/codebase-watcher-register'

import type { IndexingProgress } from '../chat-context-processor/vectordb/process-reporter'
import { Controller } from '../types'

export class CodebaseController extends Controller {
  readonly name = 'codebase'

  async *reindexWorkspace(req: {
    type: 'full' | 'diff'
  }): AsyncGenerator<IndexingProgress, void, unknown> {
    const { type } = req
    const codebaseWatcherRegister = this.registerManager.getRegister(
      CodebaseWatcherRegister
    )

    if (!codebaseWatcherRegister) throw new Error('Codebase watcher not found')

    let isIndexingComplete = false
    const stream = new ReadableStream<IndexingProgress>({
      start(controller) {
        codebaseWatcherRegister.indexer?.setProgressCallback(progress => {
          controller.enqueue(progress)
        })
      }
    })

    const reader = stream.getReader()
    const indexingPromise = codebaseWatcherRegister.indexer
      ?.reindexWorkspace(type)
      .then(() => {
        isIndexingComplete = true
      })

    try {
      while (!isIndexingComplete) {
        const { done, value } = await reader.read()
        if (done) break
        yield value
      }
    } finally {
      reader.releaseLock()
      codebaseWatcherRegister.indexer?.setProgressCallback(() => {})
    }

    await indexingPromise
  }
}
