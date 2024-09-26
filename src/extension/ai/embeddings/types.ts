import { Embeddings } from '@langchain/core/embeddings'

type ClassType<T> = (new (...args: any[]) => T) & {
  [K in keyof typeof BaseEmbeddings]: (typeof BaseEmbeddings)[K]
}

export interface BaseEmbeddingModelInfo<
  T extends BaseEmbeddings = BaseEmbeddings
> {
  type: string
  modelName: string
  dimensions: number
  maxTokens: number
  batchSize: number
  EmbeddingClass: ClassType<T>
  buildConstructParams?: (modelInfo: BaseEmbeddingModelInfo) => any
}

export abstract class BaseEmbeddings extends Embeddings {
  async init?(): Promise<void> {
    // Default implementation (can be overridden by subclasses)
  }

  dispose?(): void {
    // Default implementation (can be overridden by subclasses)
  }
}
