import crypto from 'crypto'
import { MAX_EMBEDDING_TOKENS } from '@extension/constants'
import { createShouldIgnore } from '@extension/file-utils/ignore-patterns'
import { getExt } from '@extension/file-utils/paths'
import { traverseFileOrFolders } from '@extension/file-utils/traverse-fs'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { logger } from '@extension/logger'
import { getWorkspaceFolder } from '@extension/utils'
import { OpenAIEmbeddings } from '@langchain/openai'
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

  private embeddings: OpenAIEmbeddings

  private indexingQueue: string[] = []

  private isIndexing: boolean = false

  constructor(workspaceRootPath?: string) {
    this.workspaceRootPath =
      workspaceRootPath || getWorkspaceFolder().uri.fsPath
    this.databaseManager = new CodeChunksIndexTable()
    this.progressReporter = new ProgressReporter()
    this.embeddings = new OpenAIEmbeddings()
  }

  async initialize() {
    await this.databaseManager.initialize()
  }

  setProgressCallback(callback: ProgressCallback) {
    this.progressReporter.setCallback(callback)
  }

  async indexWorkspace() {
    const filePaths = await this.getAllIndexedFilePaths()
    await this.processFiles(filePaths)
  }

  async handleFileChange(filePath: string) {
    try {
      if (!(await this.isAvailableFile(filePath))) return

      await this.databaseManager.deleteFileFromIndex(filePath)
      await this.queueFileForIndexing(filePath)
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

  async searchSimilarCode(query: string): Promise<vscode.Location[]> {
    const embedding = await this.embeddings.embedQuery(query)
    const results = await this.databaseManager.searchSimilarCode(embedding)

    return results.map(
      result =>
        new vscode.Location(
          vscode.Uri.file(result.fullPath),
          new vscode.Range(
            result.startLine,
            result.startCharacter,
            result.endLine,
            result.endCharacter
          )
        )
    )
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
    const totalFiles = filePaths.length
    let processedFiles = 0

    for (const filePath of filePaths) {
      await this.queueFileForIndexing(filePath)
      processedFiles++
      this.progressReporter.report(processedFiles, totalFiles, filePath)
    }
  }

  private async queueFileForIndexing(filePath: string) {
    this.indexingQueue.push(filePath)
    if (!this.isIndexing) {
      this.processIndexingQueue()
    }
  }

  private async processIndexingQueue() {
    this.isIndexing = true
    while (this.indexingQueue.length > 0) {
      const filePath = this.indexingQueue.shift()!
      try {
        await this.indexFile(filePath)
      } catch (error) {
        logger.error(`Error indexing file ${filePath}:`, error)
      }
    }
    this.isIndexing = false
  }

  private async indexFile(filePath: string) {
    try {
      const rows = await this.createCodeChunkRows(filePath)
      await this.databaseManager.addRows(rows)
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

  private async chunkCodeFile(filePath: string): Promise<TextChunk[]> {
    const manager = CodeChunkerManager.getInstance()
    const chunker = await manager.getChunkerFromFilePath(filePath)
    const content = await VsCodeFS.readFile(filePath)
    const chunks = await chunker.chunkCode(content, {
      maxTokenLength: MAX_EMBEDDING_TOKENS,
      removeDuplicates: true
    })

    return chunks
  }

  private async createCodeChunkRows(filePath: string): Promise<CodeChunkRow[]> {
    const chunks = await this.chunkCodeFile(filePath)

    const table = await this.databaseManager.getOrCreateTable()

    logger.log('chunks', chunks, await table.filter('true').execute())

    const chunkRowsPromises = chunks.map(async chunk => {
      const embedding = await this.embeddings.embedQuery(chunk.text)
      const fileHash = await this.generateFileHash(filePath)
      return {
        relativePath: vscode.workspace.asRelativePath(filePath),
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
    const totalFiles = filePaths.length

    const tasks = filePaths.map(async (filePath, index) => {
      try {
        const currentHash = await this.generateFileHash(filePath)
        const existingRows = await this.databaseManager.getFileRows(filePath)

        if (
          existingRows.length === 0 ||
          existingRows[0]?.fileHash !== currentHash
        ) {
          await this.databaseManager.deleteFileFromIndex(filePath)
          await this.indexFile(filePath)
        }

        this.progressReporter.report(index + 1, totalFiles, filePath)
      } catch (error) {
        logger.error(`Error processing file ${filePath}:`, error)
      }
    })

    await Promise.allSettled(tasks)
  }
}
