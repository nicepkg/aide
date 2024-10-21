import { CodebaseWatcherRegister } from '@extension/registers/codebase-watcher-register'

import type { ProgressInfo } from '../chat-context-processor/utils/progress-reporter'
import type { ReIndexType } from '../chat-context-processor/vectordb/base-indexer'
import { Controller } from '../types'

export class CodebaseController extends Controller {
  readonly name = 'codebase'

  async *reindexCodebase(req: {
    type: ReIndexType
  }): AsyncGenerator<ProgressInfo, void, unknown> {
    const { type } = req
    const codebaseWatcherRegister = this.registerManager.getRegister(
      CodebaseWatcherRegister
    )

    if (!codebaseWatcherRegister) throw new Error('Codebase watcher not found')

    const { indexer } = codebaseWatcherRegister
    if (!indexer) throw new Error('Indexer not found')

    const indexingPromise = indexer.reindexWorkspace(type)

    for await (const progress of indexer.progressReporter.getProgressIterator()) {
      yield progress
    }

    await indexingPromise
  }
}
