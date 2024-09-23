import { aidePaths } from '@extension/file-utils/paths'
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

  private schema = new Schema([
    new Field('relativePath', new Utf8()),
    new Field('fullPath', new Utf8()),
    new Field('fileHash', new Utf8()),
    new Field('startLine', new Int32()),
    new Field('startCharacter', new Int32()),
    new Field('endLine', new Int32()),
    new Field('endCharacter', new Int32()),
    new Field(
      'embedding',
      new FixedSizeList(384, new Field('emb', new Float32()))
    )
  ])

  async initialize() {
    try {
      const lanceDbDir = aidePaths.getLanceDbPath()
      this.lanceDb = await connect(lanceDbDir)
      logger.log('LanceDB initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize LanceDB:', error)
      throw error
    }
  }

  async getOrCreateTable(): Promise<Table<number[]>> {
    const tableName = 'code_chunks_embeddings'
    try {
      const tables = await this.lanceDb.tableNames()
      return tables.includes(tableName)
        ? await this.lanceDb.openTable(tableName)
        : await this.lanceDb.createTable({
            name: tableName,
            schema: this.schema
          })
    } catch (error) {
      logger.error('Error getting or creating table:', error)
      throw error
    }
  }

  async addRows(rows: CodeChunkRow[]) {
    const table = await this.getOrCreateTable()
    await table.add(rows as any)
  }

  async deleteFileFromIndex(filePath: string) {
    const table = await this.getOrCreateTable()
    await table.delete(`fullPath = '${filePath}'`)
  }

  async clearIndex() {
    const table = await this.getOrCreateTable()
    await table.delete('true')
  }

  async searchSimilarCode(embedding: number[]): Promise<CodeChunkRow[]> {
    const table = await this.getOrCreateTable()
    return await table.search(embedding).limit(10).execute<CodeChunkRow>()
  }

  async getFileRows(filePath: string): Promise<CodeChunkRow[]> {
    const table = await this.getOrCreateTable()
    return await table
      .filter(`fullPath = '${filePath}'`)
      .execute<CodeChunkRow>()
  }
}
