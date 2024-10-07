import { aidePaths } from '@extension/file-utils/paths'
import { logger } from '@extension/logger'

import {
  DocCrawler,
  type CrawlerOptions
} from '../chat-context-processor/utils/doc-crawler'
import type { ProgressInfo } from '../chat-context-processor/utils/process-reporter'
import type { ReIndexType } from '../chat-context-processor/vectordb/base-indexer'
import { DocIndexer } from '../chat-context-processor/vectordb/doc-indexer'
import { docSitesDB } from '../lowdb/doc-sites-db'
import { Controller } from '../types'

export class DocController extends Controller {
  readonly name = 'doc'

  private docCrawlers: Record<string, DocCrawler> = {}

  private docIndexers: Record<string, DocIndexer> = {}

  async getDocSites() {
    return await docSitesDB.getAll()
  }

  async addDocSite(request: { name: string; url: string }) {
    return await docSitesDB.add(request)
  }

  async removeDocSite(request: { id: string }) {
    await docSitesDB.remove(request.id)
    this.disposeResources(request.id)
  }

  async *crawlDocs(request: {
    id: string
    options?: Partial<CrawlerOptions>
  }): AsyncGenerator<ProgressInfo, void, unknown> {
    try {
      const site = await this.findSiteById(request.id)
      if (!site) throw new Error('找不到文档站点')

      const crawler = this.initiateCrawler(
        request.id,
        site.url,
        request.options
      )
      const crawlingCompleted = crawler.crawl()

      yield* this.reportProgress(crawler.progressReporter.getProgressIterator())
      await crawlingCompleted

      await docSitesDB.updateStatus(request.id, { isCrawled: true })
      logger.log('文档抓取完成')
    } finally {
      this.disposeCrawler(request.id)
    }
  }

  async *reindexDocs(
    request: { id: string },
    type: ReIndexType = 'full'
  ): AsyncGenerator<ProgressInfo, void, unknown> {
    try {
      const site = await this.findSiteById(request.id)
      if (!site) throw new Error('can not find doc site')
      if (!site.isCrawled) throw new Error('please crawl the site first')

      const indexer = await this.initiateIndexer(request.id)
      await indexer.initialize()

      const indexingCompleted = indexer.reindexWorkspace(type)
      yield* this.reportProgress(indexer.progressReporter.getProgressIterator())
      await indexingCompleted

      await docSitesDB.updateStatus(request.id, { isIndexed: true })
      logger.log('文档索引完成')
    } finally {
      this.disposeIndexer(request.id)
    }
  }

  async updateDocSite(request: { id: string; name: string; url: string }) {
    const { id, ...updates } = request
    return await docSitesDB.update(id, updates)
  }

  async searchDocSites(query: string) {
    const sites = await docSitesDB.getAll()
    return sites.filter(
      site =>
        site.name.toLowerCase().includes(query.toLowerCase()) ||
        site.url.toLowerCase().includes(query.toLowerCase())
    )
  }

  private async findSiteById(id: string) {
    const sites = await docSitesDB.getAll()
    return sites.find(site => site.id === id)
  }

  private initiateCrawler(
    id: string,
    url: string,
    options?: Partial<CrawlerOptions>
  ) {
    if (this.docCrawlers[id]) return this.docCrawlers[id]!
    const crawler = new DocCrawler(url, options)
    this.docCrawlers[id] = crawler
    return crawler
  }

  private async initiateIndexer(id: string) {
    if (this.docIndexers[id]) return this.docIndexers[id]!
    const site = await this.findSiteById(id)
    const docsPath = DocCrawler.getDocCrawlerFolderPath(site!.url)
    const dbPath = aidePaths.getGlobalLanceDbPath()
    const indexer = new DocIndexer(docsPath, dbPath)
    this.docIndexers[id] = indexer
    return indexer
  }

  private disposeResources(id: string) {
    this.disposeCrawler(id)
    this.disposeIndexer(id)
  }

  private disposeCrawler(id: string) {
    this.docCrawlers[id]?.dispose()
    delete this.docCrawlers[id]
  }

  private disposeIndexer(id: string) {
    this.docIndexers[id]?.dispose()
    delete this.docIndexers[id]
  }

  private async *reportProgress(progressIterator: AsyncIterable<ProgressInfo>) {
    for await (const progress of progressIterator) {
      yield progress
    }
  }
}
