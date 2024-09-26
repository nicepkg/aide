import { EmbeddingManager } from '@extension/ai/embeddings/embedding-manager'
import { aidePaths, getSemanticHashName } from '@extension/file-utils/paths'
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

import { CodeChunkRow } from './types'

export class CodeChunksIndexTable {
  private lanceDb!: Connection

  async initialize() {
    try {
      const lanceDbDir = aidePaths.getLanceDbPath()
      this.lanceDb = await connect(lanceDbDir)
      logger.log('LanceDB initialized successfully', { lanceDbDir })
    } catch (error) {
      logger.error('Failed to initialize LanceDB:', error)
      throw error
    }
  }

  async getTableName(): Promise<string> {
    const { modelName } = EmbeddingManager.getInstance().getActiveModelInfo()
    const semanticModelName = getSemanticHashName(modelName)
    return `code_chunks_embeddings_${semanticModelName}`
  }

  async getOrCreateTable(): Promise<Table<number[]>> {
    const tableName = await this.getTableName()
    const { dimensions } = EmbeddingManager.getInstance().getActiveModelInfo()

    try {
      const tables = await this.lanceDb.tableNames()

      if (tables.includes(tableName))
        return await this.lanceDb.openTable(tableName)

      const schema = new Schema([
        new Field('relativePath', new Utf8()),
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
      ])

      return await this.lanceDb.createTable({
        name: tableName,
        schema
      })
    } catch (error) {
      logger.error('Error getting or creating table:', error)
      throw error
    }
  }

  async dropTable() {
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

  async addRows(rows: CodeChunkRow[]) {
    const table = await this.getOrCreateTable()
    await table.add(rows as any)
  }

  async deleteFileFromIndex(filePath: string) {
    const table = await this.getOrCreateTable()
    await table.delete(`\`fullPath\` = '${filePath}'`)
  }

  async clearIndex() {
    await this.dropTable()
  }

  async searchSimilarCode(embedding: number[]): Promise<CodeChunkRow[]> {
    const table = await this.getOrCreateTable()
    return await table.search(embedding).limit(10).execute<CodeChunkRow>()
  }

  async getFileRows(filePath: string): Promise<CodeChunkRow[]> {
    const table = await this.getOrCreateTable()
    return await table
      .filter(`\`fullPath\` = '${filePath}'`)
      .execute<CodeChunkRow>()
  }

  async getAllRows(): Promise<CodeChunkRow[]> {
    const table = await this.getOrCreateTable()
    return await table.filter('true').execute<CodeChunkRow>()
  }
}
