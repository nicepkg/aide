import crypto from 'crypto'
import { EmbeddingManager } from '@extension/ai/embeddings/embedding-manager'
import type { BaseEmbeddings } from '@extension/ai/embeddings/types'
import { createShouldIgnore } from '@extension/file-utils/ignore-patterns'
import { getExt } from '@extension/file-utils/paths'
import { traverseFileOrFolders } from '@extension/file-utils/traverse-fs'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { logger } from '@extension/logger'
import { getWorkspaceFolder } from '@extension/utils'
import { languageIdExts } from '@shared/utils/vscode-lang'
import * as vscode from 'vscode'

import { CodeChunkerManager, type TextChunk } from '../tree-sitter/code-chunker'
import { treeSitterExtLanguageMap } from '../tree-sitter/constants'
import { CodeChunksIndexTable } from './code-chunks-index-table'
import { ProgressReporter, type ProgressCallback } from './process-reporter'
import { CodeChunkRow } from './types'

export class CodebaseIndexer {
  private workspaceRootPath: string

  private databaseManager: CodeChunksIndexTable

  private progressReporter: ProgressReporter

  private embeddings!: BaseEmbeddings

  private isIndexing: boolean = false

  private indexingQueue: string[] = []

  private totalFiles: number = 0

  constructor(workspaceRootPath?: string) {
    this.workspaceRootPath =
      workspaceRootPath || getWorkspaceFolder().uri.fsPath
    this.databaseManager = new CodeChunksIndexTable()
    this.progressReporter = new ProgressReporter()
  }

  async initialize() {
    this.embeddings = await EmbeddingManager.getInstance().getActiveEmbedding()
    await this.databaseManager.initialize()
  }

  setProgressCallback(callback: ProgressCallback) {
    this.progressReporter.setCallback(callback)
  }

  async indexWorkspace() {
    const filePaths = await this.getAllIndexedFilePaths()
    this.totalFiles = filePaths.length
    await this.processFiles(filePaths)
  }

  async handleFileChange(filePath: string) {
    try {
      if (!(await this.isAvailableFile(filePath))) return

      await this.databaseManager.deleteFileFromIndex(filePath)
      this.processFiles([filePath])
    } catch (error) {
      logger.error(`Error handling file change for ${filePath}:`, error)
    }
  }

  async handleFileDelete(filePath: string) {
    try {
      if (!(await this.isAvailableFile(filePath))) return

      await this.databaseManager.deleteFileFromIndex(filePath)
      logger.log(`Removed index for deleted file: ${filePath}`)
    } catch (error) {
      logger.error(`Error handling file deletion for ${filePath}:`, error)
    }
  }

  async reindexWorkspace(type: 'full' | 'diff' = 'full') {
    try {
      if (type === 'full') {
        await this.databaseManager.clearIndex()
        await this.indexWorkspace()
      } else {
        await this.diffReindex()
      }
      logger.log('Workspace reindexed successfully')
    } catch (error) {
      logger.error('Error reindexing workspace:', error)
      throw error
    }
  }

  async deleteWorkspaceIndex() {
    await this.databaseManager.clearIndex()
  }

  async searchSimilarCode(query: string): Promise<CodeChunkRow[]> {
    const embedding = await this.embeddings.embedQuery(query)
    const results = await this.databaseManager.searchSimilarCode(embedding)

    return results
  }

  private isAvailableExtFile(filePath: string): boolean {
    const allowExt = new Set([
      ...Object.keys(treeSitterExtLanguageMap),
      ...languageIdExts
    ])
    return allowExt.has(getExt(filePath)!.toLowerCase())
  }

  // for handle change use
  private async isAvailableFile(filePath: string): Promise<boolean> {
    const shouldIgnore = await createShouldIgnore(this.workspaceRootPath)

    return !shouldIgnore(filePath) && this.isAvailableExtFile(filePath)
  }

  private async getAllIndexedFilePaths(): Promise<string[]> {
    const filePaths = await traverseFileOrFolders({
      type: 'file',
      filesOrFolders: ['./'],
      isGetFileContent: false,
      workspacePath: this.workspaceRootPath,
      itemCallback: fileInfo => fileInfo.fullPath
    })

    return filePaths.filter(filePath => this.isAvailableExtFile(filePath))
  }

  private async processFiles(filePaths: string[]) {
    this.indexingQueue.push(...filePaths)

    if (this.isIndexing) return
    this.isIndexing = true

    while (this.indexingQueue.length > 0) {
      const filePath = this.indexingQueue.shift()!
      try {
        await this.indexFile(filePath)
      } catch (error) {
        logger.error(`Error indexing file ${filePath}:`, error)
      } finally {
        this.progressReporter.report(
          this.totalFiles - this.indexingQueue.length,
          this.totalFiles
        )
      }
    }
    this.isIndexing = false
  }

  private async indexFile(filePath: string) {
    try {
      const rows = await this.createCodeChunkRows(filePath)
      await this.databaseManager.addRows(rows)

      logger.dev.verbose(
        'Table all rows:',
        await this.databaseManager.getAllRows()
      )

      logger.log(`Indexed file: ${filePath}`)
    } catch (error) {
      logger.error(`Error indexing file ${filePath}:`, error)
      throw error
    }
  }

  private async generateFileHash(filePath: string): Promise<string> {
    const content = await VsCodeFS.readFile(filePath)
    return crypto.createHash('sha256').update(content, 'utf-8').digest('hex')
  }

  async isValidRow(row: CodeChunkRow): Promise<boolean> {
    // valid file hash
    const currentHash = await this.generateFileHash(row.fullPath)
    if (currentHash !== row.fileHash) return false

    return true
  }

  async getRowFileContent(row: CodeChunkRow): Promise<string> {
    const content = await VsCodeFS.readFile(row.fullPath)
    return content
  }

  private async chunkCodeFile(filePath: string): Promise<TextChunk[]> {
    const chunker =
      await CodeChunkerManager.getInstance().getChunkerFromFilePath(filePath)
    const content = await VsCodeFS.readFile(filePath)
    const { maxTokens } = EmbeddingManager.getInstance().getActiveModelInfo()

    const chunks = await chunker.chunkCode(content, {
      maxTokenLength: maxTokens,
      removeDuplicates: true
    })

    return chunks
  }

  private async createCodeChunkRows(filePath: string): Promise<CodeChunkRow[]> {
    const chunks = await this.chunkCodeFile(filePath)
    const relativePath = vscode.workspace.asRelativePath(filePath)

    logger.dev.verbose('code chunks', chunks)

    const chunkRowsPromises = chunks.map(async chunk => {
      const embedding = await this.embeddings.embedQuery(
        `file path: ${relativePath}\n\n${chunk.text}`
      )
      const fileHash = await this.generateFileHash(filePath)
      return {
        relativePath,
        fullPath: filePath,
        fileHash,
        startLine: chunk.range.startLine,
        startCharacter: chunk.range.startColumn,
        endLine: chunk.range.endLine,
        endCharacter: chunk.range.endColumn,
        embedding
      }
    })

    const chunkRowsResults = await Promise.allSettled(chunkRowsPromises)
    const chunkRows: CodeChunkRow[] = []

    chunkRowsResults.forEach(result => {
      if (result.status === 'fulfilled') {
        chunkRows.push(result.value)
      } else {
        logger.warn('Error creating code chunk row:', result.reason)
      }
    })

    return chunkRows
  }

  private async diffReindex() {
    const filePaths = await this.getAllIndexedFilePaths()
    const filePathsNeedReindex: string[] = []
    const tasks = filePaths.map(async filePath => {
      try {
        const currentHash = await this.generateFileHash(filePath)
        const existingRows = await this.databaseManager.getFileRows(filePath)

        if (
          existingRows.length === 0 ||
          existingRows[0]?.fileHash !== currentHash
        ) {
          await this.databaseManager.deleteFileFromIndex(filePath)
          filePathsNeedReindex.push(filePath)
        }
      } catch (error) {
        logger.error(`Error processing file ${filePath}:`, error)
      }
    })

    await Promise.allSettled(tasks)

    this.totalFiles = filePathsNeedReindex.length

    await this.processFiles(filePathsNeedReindex)
  }
}
