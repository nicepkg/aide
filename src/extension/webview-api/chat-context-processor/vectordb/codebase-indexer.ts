import { EmbeddingManager } from '@extension/ai/embeddings/embedding-manager'
import { createShouldIgnore } from '@extension/file-utils/ignore-patterns'
import { getExt, getSemanticHashName } from '@extension/file-utils/paths'
import { traverseFileOrFolders } from '@extension/file-utils/traverse-fs'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { logger } from '@extension/logger'
import { settledPromiseResults } from '@shared/utils/common'
import { languageIdExts } from '@shared/utils/vscode-lang'
import * as vscode from 'vscode'

import { CodeChunkerManager, type TextChunk } from '../tree-sitter/code-chunker'
import { treeSitterExtLanguageMap } from '../tree-sitter/constants'
import { BaseIndexer, IndexRow } from './base-indexer'

export interface CodeChunkRow extends IndexRow {
  relativePath: string
}

export class CodebaseIndexer extends BaseIndexer<CodeChunkRow> {
  constructor(
    private workspaceRootPath: string,
    dbPath: string
  ) {
    super(dbPath)
  }

  async getTableName(): Promise<string> {
    const { modelName } = EmbeddingManager.getInstance().getActiveModelInfo()
    const semanticModelName = getSemanticHashName(modelName)
    return `code_chunks_embeddings_${semanticModelName}`
  }

  async indexFile(filePath: string): Promise<void> {
    try {
      const rows = await this.createCodeChunkRows(filePath)
      await this.addRows(rows)
      logger.log(`Indexed file: ${filePath}`)
    } catch (error) {
      logger.error(`Error indexing file ${filePath}:`, error)
      throw error
    }
  }

  private async createCodeChunkRows(filePath: string): Promise<CodeChunkRow[]> {
    const chunks = await this.chunkCodeFile(filePath)
    const relativePath = vscode.workspace.asRelativePath(filePath)

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
    return await traverseFileOrFolders({
      type: 'file',
      filesOrFolders: ['./'],
      isGetFileContent: false,
      workspacePath: this.workspaceRootPath,
      customShouldIgnore: (fullFilePath: string) =>
        !this.isAvailableFile(fullFilePath),
      itemCallback: fileInfo => fileInfo.fullPath
    })
  }

  private isAvailableExtFile(filePath: string): boolean {
    const allowExt = new Set([
      ...Object.keys(treeSitterExtLanguageMap),
      ...languageIdExts
    ])
    return allowExt.has(getExt(filePath)!.toLowerCase())
  }

  async isAvailableFile(filePath: string): Promise<boolean> {
    const shouldIgnore = await createShouldIgnore(this.workspaceRootPath)
    return !shouldIgnore(filePath) && this.isAvailableExtFile(filePath)
  }
}
