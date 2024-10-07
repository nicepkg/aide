import path from 'path'
import { EmbeddingManager } from '@extension/ai/embeddings/embedding-manager'
import { getSemanticHashName } from '@extension/file-utils/paths'
import { traverseFileOrFolders } from '@extension/file-utils/traverse-fs'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { logger } from '@extension/logger'
import { settledPromiseResults } from '@shared/utils/common'

import { CodeChunkerManager, type TextChunk } from '../tree-sitter/code-chunker'
import { ProgressReporter } from '../utils/process-reporter'
import { BaseIndexer, IndexRow } from './base-indexer'

export interface DocChunkRow extends IndexRow {}

export class DocIndexer extends BaseIndexer<DocChunkRow> {
  constructor(
    private docsRootPath: string,
    dbPath: string
  ) {
    super(dbPath)
    this.progressReporter = new ProgressReporter()
  }

  async getTableName(): Promise<string> {
    const { modelName } = EmbeddingManager.getInstance().getActiveModelInfo()
    const semanticModelName = getSemanticHashName(modelName)
    const docPathName = getSemanticHashName(
      path.basename(this.docsRootPath),
      this.docsRootPath
    )

    return `doc_chunks_embeddings_${semanticModelName}_${docPathName}`
  }

  async indexFile(filePath: string): Promise<void> {
    try {
      const rows = await this.createDocChunkRows(filePath)
      await this.addRows(rows)
      logger.log(`Indexed file: ${filePath}`)
    } catch (error) {
      logger.error(`Error indexing file ${filePath}:`, error)
      throw error
    }
  }

  private async createDocChunkRows(filePath: string): Promise<DocChunkRow[]> {
    const chunks = await this.chunkCodeFile(filePath)

    const chunkRowsPromises = chunks.map(async chunk => {
      const embedding = await this.embeddings.embedQuery(chunk.text)
      const fileHash = await this.generateFileHash(filePath)
      return {
        fullPath: filePath,
        fileHash,
        startLine: chunk.range.startLine,
        startCharacter: chunk.range.startColumn,
        endLine: chunk.range.endLine,
        endCharacter: chunk.range.endColumn,
        embedding
      }
    })

    return settledPromiseResults(chunkRowsPromises)
  }

  private async chunkCodeFile(filePath: string): Promise<TextChunk[]> {
    const chunker =
      await CodeChunkerManager.getInstance().getChunkerFromFilePath(filePath)
    const content = await VsCodeFS.readFile(filePath)
    const { maxTokens } = EmbeddingManager.getInstance().getActiveModelInfo()

    return chunker.chunkCode(content, {
      maxTokenLength: maxTokens,
      removeDuplicates: true
    })
  }

  async getAllIndexedFilePaths(): Promise<string[]> {
    return traverseFileOrFolders({
      type: 'file',
      filesOrFolders: [this.docsRootPath],
      isGetFileContent: false,
      workspacePath: this.docsRootPath,
      customShouldIgnore: (fullFilePath: string) =>
        !this.isAvailableFile(fullFilePath),
      itemCallback: fileInfo => fileInfo.fullPath
    })
  }

  async isAvailableFile(filePath: string): Promise<boolean> {
    return filePath.endsWith('.md')
  }

  async indexWorkspace(): Promise<void> {
    const filePaths = await this.getAllIndexedFilePaths()
    this.progressReporter.setTotalItems(filePaths.length)
    for (const filePath of filePaths) {
      await this.indexFile(filePath)
      this.progressReporter.incrementProcessedItems()
    }
  }
}
