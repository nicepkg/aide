import { OpenAIEmbeddings } from '@langchain/openai'

import { TransformerJsEmbeddings } from './transformer-js-embeddings'
import { BaseEmbeddingModelInfo, BaseEmbeddings } from './types'

export const embeddingModels = [
  {
    type: 'transformer-js',
    modelName: 'all-MiniLM-L6-v2',
    dimensions: 384,
    maxTokens: 512,
    batchSize: 512,
    EmbeddingClass: TransformerJsEmbeddings,
    buildConstructParams: modelInfo => ({
      modelInfo
    })
  },
  {
    type: 'openai',
    modelName: 'text-embedding-ada-002',
    dimensions: 1536,
    maxTokens: 8191,
    batchSize: 512,
    EmbeddingClass: OpenAIEmbeddings
  }
] as const satisfies BaseEmbeddingModelInfo[]

export class EmbeddingManager {
  private static instance: EmbeddingManager

  private embeddings: Map<string, BaseEmbeddings> = new Map()

  private activeModelKey: string | null = null

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance(): EmbeddingManager {
    if (!EmbeddingManager.instance) {
      EmbeddingManager.instance = new EmbeddingManager()
    }
    return EmbeddingManager.instance
  }

  async getEmbedding(
    modelInfo: BaseEmbeddingModelInfo
  ): Promise<BaseEmbeddings> {
    const key = modelInfo.modelName

    if (!this.embeddings.has(key)) {
      const { EmbeddingClass, buildConstructParams } = modelInfo
      const embedding = new EmbeddingClass(
        buildConstructParams?.(modelInfo) ?? {}
      )
      await embedding.init?.()
      this.embeddings.set(key, embedding)
    }

    return this.embeddings.get(key)!
  }

  async setActiveModel(modelInfo: BaseEmbeddingModelInfo): Promise<void> {
    await this.getEmbedding(modelInfo)
    this.activeModelKey = modelInfo.modelName
  }

  getActiveModelInfo(): BaseEmbeddingModelInfo {
    if (!this.activeModelKey) throw new Error('No active embedding model set')

    const activeModel = embeddingModels.find(
      model => model.modelName === this.activeModelKey
    )
    if (!activeModel) throw new Error('No active embedding model set')

    return activeModel
  }

  async getActiveEmbedding(): Promise<BaseEmbeddings> {
    const modelInfo = this.getActiveModelInfo()
    return await this.getEmbedding(modelInfo)
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const embedding = await this.getActiveEmbedding()
    return embedding.embedDocuments(texts)
  }

  async embedQuery(text: string): Promise<number[]> {
    const embedding = await this.getActiveEmbedding()
    return embedding.embedQuery(text)
  }

  async embedDocumentsWithModel(
    modelInfo: BaseEmbeddingModelInfo,
    texts: string[]
  ): Promise<number[][]> {
    const embedding = await this.getEmbedding(modelInfo)
    return embedding.embedDocuments(texts)
  }

  async embedQueryWithModel(
    modelInfo: BaseEmbeddingModelInfo,
    text: string
  ): Promise<number[]> {
    const embedding = await this.getEmbedding(modelInfo)
    return embedding.embedQuery(text)
  }

  dispose() {
    for (const embedding of this.embeddings.values()) {
      embedding.dispose?.()
    }
    this.embeddings.clear()
    this.activeModelKey = null
  }
}
