/* eslint-disable func-names */
import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import { aidePaths, getSemanticHashName } from '@extension/file-utils/paths'
import { logger } from '@extension/logger'
import * as cheerio from 'cheerio'
import type { Element } from 'domhandler'
import TurndownService from 'turndown'

import { ProgressReporter } from './progress-reporter'

export interface CrawlerOptions {
  maxDepth: number
  maxPages: number
  delay: number
  concurrency: number
  selectors: string[]
  linkFilter: (url: string) => boolean
}

interface QueueItem {
  url: string
  depth: number
}

export class DocCrawler {
  private baseUrl: string

  private options: CrawlerOptions

  private visited: Set<string>

  private queue: QueueItem[]

  private content: { [url: string]: string }

  private depthMap: Map<string, number>

  private turndownService: TurndownService

  private domainDir: string

  progressReporter = new ProgressReporter()

  static getDocCrawlerFolderPath(baseUrl: string) {
    const parsedUrl = new URL(baseUrl)
    const domainFolderName = getSemanticHashName(
      parsedUrl.hostname,
      parsedUrl.hostname
    )
    return path.join(aidePaths.getDocCrawlerPath(), domainFolderName)
  }

  constructor(baseUrl: string, options: Partial<CrawlerOptions> = {}) {
    this.baseUrl = baseUrl
    this.options = {
      maxDepth: 3,
      maxPages: 100,
      delay: 1000,
      concurrency: 5,
      selectors: [
        '#app',
        '#root',
        '#__next',
        '.app',
        '.application',
        '[data-reactroot]',
        '[data-react-container]',
        '.vue-application',
        '.nuxt-content',
        '.svelte-app',
        'main',
        '#main',
        '.main',
        'article',
        '.article',
        '#content',
        '.content',
        '#main-content',
        '.main-content',
        '.post-content',
        '.entry-content',
        '.page-content',
        '.documentation',
        '.docs',
        '#docs',
        '.doc-content',
        '#documentation',
        '.markdown-section',
        '.readme',
        '[role="main"]',
        '[role="article"]',
        '[role="contentinfo"]',
        '[role="document"]',
        '.article',
        '.blog-post',
        '.news-article',
        '.entry',
        '.hentry',
        '.single',
        '.page',
        '.post-body',
        '.entry-body',
        '.markdown-body',
        '.wikidoc',
        '.docsum',
        '.technical-content',
        '.docs-content',
        '.api-docs',
        '.method-doc',
        '.function-doc',
        '.thread-content',
        '.forum-post',
        '.message-body',
        '.product-description',
        '.item-details',
        '.main-panel',
        '.center-content',
        '.primary-content',
        '.site-content',
        '[itemprop="articleBody"]',
        '[itemprop="mainContentOfPage"]'
      ],
      linkFilter: () => true,
      ...options
    }
    this.visited = new Set()
    this.queue = [{ url: baseUrl, depth: 0 }]
    this.content = {}
    this.depthMap = new Map([[baseUrl, 0]])
    this.turndownService = new TurndownService()
    this.domainDir = DocCrawler.getDocCrawlerFolderPath(baseUrl)
  }

  private generateRandomUserAgent(): string {
    const osList = ['Windows NT 10.0', 'Windows NT 6.1', 'Macintosh', 'X11']
    const browserList = ['Chrome', 'Firefox', 'Safari']
    const os = osList[Math.floor(Math.random() * osList.length)]
    const browser = browserList[Math.floor(Math.random() * browserList.length)]
    const version = Math.floor(Math.random() * 70) + 30

    if (os === 'X11') {
      return `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`
    }
    if (os === 'Macintosh') {
      return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15`
    }
    return `Mozilla/5.0 (${os}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ${browser}/${version}.0.0.0 Safari/537.36`
  }

  private generateRandomIP(): string {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
  }

  public async crawl(): Promise<void> {
    await this.clearOutputDir()
    this.progressReporter.setTotalItems(this.options.maxPages)
    while (this.queue.length > 0 && this.visited.size < this.options.maxPages) {
      const batch = this.queue.splice(0, this.options.concurrency)
      const promises = batch.map(item => this.crawlPage(item.url, item.depth))
      await Promise.allSettled(promises)
      await new Promise(resolve => setTimeout(resolve, this.options.delay))
      this.progressReporter.setProcessedItems(this.visited.size)
    }
  }

  public async getPageContent(
    pageUrl: string,
    retries: number = 3
  ): Promise<string | null> {
    try {
      const randomIP = this.generateRandomIP()
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent': this.generateRandomUserAgent(),
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'X-Forwarded-For': randomIP,
          'X-Real-IP': randomIP,
          'X-Originating-IP': randomIP,
          'CF-Connecting-IP': randomIP,
          'True-Client-IP': randomIP
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          logger.error(`Page not found: ${pageUrl}`)
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      const content = this.extractContent($)
      return content
    } catch (error) {
      logger.error(`Error crawling ${pageUrl}:`, error)
      if (retries > 0) {
        logger.log(`Retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 5000))
        await this.getPageContent(pageUrl, retries - 1)
      }
      return null
    }
  }

  private async crawlPage(
    pageUrl: string,
    depth: number,
    retries: number = 3
  ): Promise<void> {
    if (this.visited.has(pageUrl) || depth > this.options.maxDepth) return

    try {
      const randomIP = this.generateRandomIP()
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent': this.generateRandomUserAgent(),
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'X-Forwarded-For': randomIP,
          'X-Real-IP': randomIP,
          'X-Originating-IP': randomIP,
          'CF-Connecting-IP': randomIP,
          'True-Client-IP': randomIP
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          logger.error(`Page not found: ${pageUrl}`)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      const content = this.extractContent($)
      this.content[pageUrl] = content
      this.findAndQueueLinks($, pageUrl, depth)
      this.visited.add(pageUrl)
      await this.savePageContent(pageUrl, content)
    } catch (error) {
      logger.error(`Error crawling ${pageUrl}:`, error)
      if (retries > 0) {
        logger.log(`Retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 5000))
        await this.crawlPage(pageUrl, depth, retries - 1)
      }
    }
  }

  private extractContent($: cheerio.CheerioAPI): string {
    const userSelectors = this.options.selectors.join(', ')
    let mainContent = $(userSelectors)

    if (mainContent.length === 0) {
      mainContent = this.detectMainContent($)
    }

    mainContent
      .find('script, style, noscript, iframe, img, svg, header, footer, nav')
      .remove()

    mainContent
      .find('p, div')
      .filter(function (this: any) {
        return $(this).text().trim() === ''
      })
      .remove()

    mainContent.find('*').removeAttr('class').removeAttr('id')

    return this.turndownService.turndown(mainContent.html() || '')
  }

  private detectMainContent($: cheerio.CheerioAPI): cheerio.Cheerio<Element> {
    let mainContent: cheerio.Cheerio<Element> | null = null
    let maxTextLength = 0

    $('div, section').each((i, elem) => {
      const textLength = $(elem).text().trim().length
      if (textLength > maxTextLength) {
        maxTextLength = textLength
        mainContent = $(elem)
      }
    })

    return mainContent || $('body')
  }

  private findAndQueueLinks(
    $: cheerio.CheerioAPI,
    pageUrl: string,
    currentDepth: number
  ): void {
    $('a').each((i, elem) => {
      const href = $(elem).attr('href')
      if (href) {
        const fullUrl = url.resolve(pageUrl, href)
        if (this.shouldCrawl(fullUrl)) {
          this.queue.push({ url: fullUrl, depth: currentDepth + 1 })
          this.depthMap.set(fullUrl, currentDepth + 1)
        }
      }
    })
  }

  private shouldCrawl(urlToCrawl: string): boolean {
    const parsedBase = new URL(this.baseUrl)
    const parsedUrl = new URL(urlToCrawl)

    // Exclude non-documentation paths
    const excludedPaths = [
      '/about',
      '/contact',
      '/careers',
      '/jobs',
      '/team',
      '/press',
      '/media',
      '/privacy',
      '/terms',
      '/legal',
      '/support',
      '/login',
      '/signin',
      '/signup',
      '/register',
      '/account',
      '/profile',
      '/dashboard',
      '/cart',
      '/checkout',
      '/search',
      '/sitemap',
      '/rss',
      '/feed',
      '/advertise',
      '/sponsors',
      '/partners',
      '/affiliate',
      '/forum',
      '/comments',
      '/feedback',
      '/subscribe',
      '/newsletter',
      '/download',
      '/pricing',
      '/plans',
      '/store',
      '/shop',
      '/products',
      '/services',
      '/portfolio',
      '/projects',
      '/case-studies',
      '/testimonials',
      '/reviews',
      '/social',
      '/share',
      '/print',
      '/mobile',
      '/app',
      '/status',
      '/maintenance',
      '/404',
      '/500',
      '/error',
      '/donate',
      '/contribute',
      '/unsubscribe',
      '/preferences',
      '/settings',
      '/admin',
      '/wp-admin',
      '/wp-login',
      '/wp-content',
      '/wp-includes',
      '/cgi-bin',
      '/assets',
      '/static',
      '/images',
      '/img',
      '/css',
      '/js',
      '/fonts',
      '/icons'
    ]
    if (excludedPaths.some(path => parsedUrl.pathname.startsWith(path))) {
      return false
    }

    return (
      parsedUrl.hostname === parsedBase.hostname &&
      !this.visited.has(urlToCrawl) &&
      !urlToCrawl.includes('#') &&
      !this.isFileUrl(urlToCrawl) &&
      this.options.linkFilter(urlToCrawl)
    )
  }

  private isFileUrl(urlString: string): boolean {
    const fileExtensions = [
      '.pdf',
      '.doc',
      '.docx',
      '.rtf',
      '.txt',
      '.odt',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx',
      '.csv',
      '.epub',
      '.mobi',
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.bmp',
      '.tiff',
      '.svg',
      '.webp',
      '.mp3',
      '.wav',
      '.ogg',
      '.flac',
      '.aac',
      '.m4a',
      '.mp4',
      '.avi',
      '.mov',
      '.wmv',
      '.flv',
      '.webm',
      '.mkv',
      '.zip',
      '.rar',
      '.7z',
      '.tar',
      '.gz',
      '.bz2',
      '.exe',
      '.msi',
      '.bat',
      '.sh',
      '.py',
      '.js',
      '.php',
      '.xml',
      '.json',
      '.yaml',
      '.yml',
      '.sql',
      '.db',
      '.iso',
      '.ttf',
      '.otf',
      '.woff',
      '.woff2',
      '.stl',
      '.obj',
      '.dwg',
      '.psd',
      '.ai',
      '.indd',
      '.epub',
      '.mobi',
      '.azw',
      '.vmdk',
      '.vdi',
      '.ova'
    ]
    return fileExtensions.some(ext => urlString.toLowerCase().endsWith(ext))
  }

  private async clearOutputDir(): Promise<void> {
    try {
      await fs.rm(this.domainDir, { recursive: true, force: true })
      await fs.mkdir(this.domainDir, { recursive: true })
    } catch (error) {
      logger.error('Error clearing output directory:', error)
    }
  }

  private async savePageContent(url: string, content: string): Promise<void> {
    const urlObj = new URL(url)
    const fileName = getSemanticHashName(urlObj.pathname, url)
    const filePath = path.join(this.domainDir, `${fileName}.md`)
    await fs.writeFile(filePath, content)
  }

  dispose() {
    this.progressReporter.dispose()
  }
}
