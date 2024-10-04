import { aidePaths } from '@extension/file-utils/paths'
import { logger } from '@extension/logger'

import {
  DocCrawler,
  type CrawlerOptions
} from '../chat-context-processor/utils/doc-crawler'
import type { ProgressInfo } from '../chat-context-processor/utils/process-reporter'
import type { ReIndexType } from '../chat-context-processor/vectordb/base-indexer'
import { DocIndexer } from '../chat-context-processor/vectordb/doc-indexer'
import { docSitesDB } from '../lowdb/doc-sites'
import { Controller } from '../types'

export class DocController extends Controller {
  readonly name = 'doc'

  private docCrawlers: Record<string, DocCrawler> = {}

  private docIndexers: Record<string, DocIndexer> = {}

  async getDocSites() {
    return await docSitesDB.getAll()
  }

  async addDocSite(req: { url: string }) {
    return await docSitesDB.add(req.url)
  }

  async removeDocSite(req: { id: string }) {
    await docSitesDB.remove(req.id)

    this.docCrawlers[req.id]?.dispose()
    this.docIndexers[req.id]?.dispose()

    delete this.docCrawlers[req.id]
    delete this.docIndexers[req.id]
  }

  async *crawlDocs(req: {
    id: string
    options?: Partial<CrawlerOptions>
  }): AsyncGenerator<ProgressInfo, void, unknown> {
    try {
      const sites = await docSitesDB.getAll()
      const site = sites.find(s => s.id === req.id)
      if (!site) throw new Error('Doc site not found')

      const crawler = new DocCrawler(site.url, req.options)
      this.docCrawlers[req.id] = crawler

      const crawlingPromise = crawler.crawl()

      for await (const progress of crawler.progressReporter.getProgressIterator()) {
        yield progress
      }

      await crawlingPromise
      logger.log('Document crawling completed')
    } finally {
      this.docCrawlers[req.id]?.dispose()
      delete this.docCrawlers[req.id]
    }
  }

  async *reindexDocs(
    req: { id: string },
    type: ReIndexType = 'full'
  ): AsyncGenerator<ProgressInfo, void, unknown> {
    try {
      const sites = await docSitesDB.getAll()
      const site = sites.find(s => s.id === req.id)
      if (!site) throw new Error('Doc site not found')

      const docsRootPath = aidePaths.getDocCrawlerPath()
      const dbPath = aidePaths.getGlobalLanceDbPath()
      const indexer = new DocIndexer(docsRootPath, dbPath)
      this.docIndexers[req.id] = indexer

      await indexer.initialize()

      const indexingPromise = indexer.reindexWorkspace(type)

      for await (const progress of indexer.progressReporter.getProgressIterator()) {
        yield progress
      }

      await indexingPromise
      logger.log('Document indexing completed')
    } finally {
      this.docIndexers[req.id]?.dispose()
      delete this.docIndexers[req.id]
    }
  }
}
