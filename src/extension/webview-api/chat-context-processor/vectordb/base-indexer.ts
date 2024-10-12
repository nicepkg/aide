import crypto from 'crypto'
import { EmbeddingManager } from '@extension/ai/embeddings/embedding-manager'
import type { BaseEmbeddings } from '@extension/ai/embeddings/types'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { logger } from '@extension/logger'
import {
  Field,
  FixedSizeList,
  Float32,
  Int32,
  Schema,
  Utf8
} from 'apache-arrow'
import { connect, Table, type Connection } from 'vectordb'

import { ProgressReporter } from '../utils/process-reporter'

export type ReIndexType = 'full' | 'diff'

export interface IndexRow {
  fullPath: string
  fileHash: string
  startLine: number
  startCharacter: number
  endLine: number
  endCharacter: number
  embedding: number[]
}

export const createBaseTableSchemaFields = (dimensions: number) => [
  new Field('fullPath', new Utf8()),
  new Field('fileHash', new Utf8()),
  new Field('startLine', new Int32()),
  new Field('startCharacter', new Int32()),
  new Field('endLine', new Int32()),
  new Field('endCharacter', new Int32()),
  new Field(
    'embedding',
    new FixedSizeList(dimensions, new Field('emb', new Float32()))
  )
]

export abstract class BaseIndexer<T extends IndexRow> {
  protected lanceDb!: Connection

  protected embeddings!: BaseEmbeddings

  protected isIndexing: boolean = false

  protected indexingQueue: string[] = []

  protected totalFiles: number = 0

  protected maxConcurrentFiles: number = 5

  progressReporter = new ProgressReporter()

  constructor(protected dbPath: string) {}

  async initialize() {
    try {
      this.lanceDb = await connect(this.dbPath)
      this.embeddings =
        await EmbeddingManager.getInstance().getActiveEmbedding()
      logger.log('LanceDB initialized successfully', { dbPath: this.dbPath })
    } catch (error) {
      logger.error('Failed to initialize LanceDB:', error)
      throw error
    }
  }

  abstract getTableName(): Promise<string>

  abstract getTableSchema(dimensions: number): Schema

  async getOrCreateTable(): Promise<Table<number[]>> {
    const tableName = await this.getTableName()
    const { dimensions } = EmbeddingManager.getInstance().getActiveModelInfo()

    try {
      const tables = await this.lanceDb.tableNames()

      if (tables.includes(tableName))
        return await this.lanceDb.openTable(tableName)

      const schema = this.getTableSchema(dimensions)

      return await this.lanceDb.createTable({
        name: tableName,
        schema
      })
    } catch (error) {
      logger.error('Error getting or creating table:', error)
      throw error
    }
  }

  async addRows(rows: T[]) {
    const table = await this.getOrCreateTable()
    await table.add(rows as any)
  }

  async deleteFileFromIndex(filePath: string) {
    const table = await this.getOrCreateTable()
    await table.delete(`\`fullPath\` = '${filePath}'`)
  }

  async clearIndex() {
    const tableName = await this.getTableName()
    try {
      const tables = await this.lanceDb.tableNames()
      if (tables.includes(tableName)) {
        await this.lanceDb.dropTable(tableName)
      }
    } catch (error) {
      logger.error('Error dropping table:', error)
      throw error
    }
  }

  async searchSimilar(embedding: number[]): Promise<T[]> {
    const table = await this.getOrCreateTable()
    return await table.search(embedding).limit(10).execute<T>()
  }

  async getFileRows(filePath: string): Promise<T[]> {
    const table = await this.getOrCreateTable()
    return await table.filter(`\`fullPath\` = '${filePath}'`).execute<T>()
  }

  async getAllRows(): Promise<T[]> {
    const table = await this.getOrCreateTable()
    return await table.filter('true').execute<T>()
  }

  async getRowFileContent(row: IndexRow): Promise<string> {
    return await VsCodeFS.readFile(row.fullPath)
  }

  async generateFileHash(filePath: string): Promise<string> {
    const content = await VsCodeFS.readFile(filePath)
    return crypto.createHash('sha256').update(content, 'utf-8').digest('hex')
  }

  async isValidRow(row: T): Promise<boolean> {
    const currentHash = await this.generateFileHash(row.fullPath)
    return currentHash === row.fileHash
  }

  async searchSimilarRow(query: string): Promise<T[]> {
    const embedding = await this.embeddings.embedQuery(query)
    return this.searchSimilar(embedding)
  }

  async indexWorkspace() {
    this.progressReporter.reset()
    const filePaths = await this.getAllIndexedFilePaths()
    this.totalFiles = filePaths.length
    this.progressReporter.setTotalItems(this.totalFiles)
    logger.verbose(`Indexing workspace with ${this.totalFiles} files`)
    await this.processFiles(filePaths)
  }

  async handleFileChange(filePath: string) {
    try {
      if (!(await this.isAvailableFile(filePath))) return

      await this.deleteFileFromIndex(filePath)
      this.processFiles([filePath])
    } catch (error) {
      logger.error(`Error handling file change for ${filePath}:`, error)
    }
  }

  async handleFileDelete(filePath: string) {
    try {
      if (!(await this.isAvailableFile(filePath))) return

      await this.deleteFileFromIndex(filePath)
      logger.log(`Removed index for deleted file: ${filePath}`)
    } catch (error) {
      logger.error(`Error handling file deletion for ${filePath}:`, error)
    }
  }

  async reindexWorkspace(type: ReIndexType = 'full') {
    try {
      if (type === 'full') {
        await this.clearIndex()
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

  async diffReindex() {
    this.progressReporter.reset()
    const filePaths = await this.getAllIndexedFilePaths()
    const filePathsNeedReindex: string[] = []
    const tasksPromises = filePaths.map(async filePath => {
      try {
        const currentHash = await this.generateFileHash(filePath)
        const existingRows = await this.getFileRows(filePath)

        if (
          existingRows.length === 0 ||
          existingRows[0]?.fileHash !== currentHash
        ) {
          await this.deleteFileFromIndex(filePath)
          filePathsNeedReindex.push(filePath)
        }
      } catch (error) {
        logger.error(`Error processing file ${filePath}:`, error)
      }
    })

    await Promise.allSettled(tasksPromises)

    this.totalFiles = filePathsNeedReindex.length
    this.progressReporter.setTotalItems(this.totalFiles)

    await this.processFiles(filePathsNeedReindex)
  }

  async deleteWorkspaceIndex() {
    await this.clearIndex()
  }

  private async processFiles(filePaths: string[]) {
    this.indexingQueue.push(...filePaths)

    if (this.isIndexing) return
    this.isIndexing = true

    while (this.indexingQueue.length > 0) {
      const filesToProcess = this.indexingQueue.splice(
        0,
        this.maxConcurrentFiles
      )
      const processingPromises = filesToProcess.map(filePath =>
        this.indexFile(filePath)
      )

      try {
        await Promise.allSettled(processingPromises)
      } catch (error) {
        logger.error(`Error indexing files:`, error)
      } finally {
        const processedCount = this.totalFiles - this.indexingQueue.length
        logger.verbose(
          `Processed ${processedCount} of ${this.totalFiles} files`
        )
        this.progressReporter.setProcessedItems(processedCount)
      }
    }
    this.isIndexing = false
    logger.verbose('Finished indexing all files')
  }

  abstract isAvailableFile(filePath: string): Promise<boolean>
  abstract indexFile(filePath: string): Promise<void>
  abstract getAllIndexedFilePaths(): Promise<string[]>

  dispose() {
    this.progressReporter.dispose()
    this.embeddings.dispose?.()
  }

  setMaxConcurrentFiles(max: number) {
    this.maxConcurrentFiles = Math.max(1, Math.floor(max)) // 确保最小值为1，并且是整数
  }
}
