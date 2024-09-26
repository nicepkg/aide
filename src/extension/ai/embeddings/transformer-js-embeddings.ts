import path from 'path'
import { logger } from '@extension/logger'
import type { EmbeddingsParams } from '@langchain/core/embeddings'
import { chunkArray } from '@langchain/core/utils/chunk_array'
import type {
  FeatureExtractionPipeline,
  PipelineType
} from '@xenova/transformers'
import { env, pipeline } from '@xenova/transformers'

import { BaseEmbeddingModelInfo, BaseEmbeddings } from './types'

export class TransformerJsEmbeddings extends BaseEmbeddings {
  static buildConstructParams(
    modelInfo: BaseEmbeddingModelInfo
  ): BaseEmbeddingModelInfo {
    return modelInfo
  }

  private pipeline: FeatureExtractionPipeline | null = null

  private modelInfo: BaseEmbeddingModelInfo

  constructor(
    params: { modelInfo: BaseEmbeddingModelInfo } & EmbeddingsParams
  ) {
    const { modelInfo, ...callerParams } = params

    super(callerParams)

    this.modelInfo = modelInfo
  }

  async init() {
    if (!this.pipeline) {
      env.allowLocalModels = true
      env.allowRemoteModels = false
      env.localModelPath = path.join(__EXTENSION_DIST_PATH__, `models`)

      this.pipeline = (await pipeline(
        'feature-extraction' as PipelineType,
        this.modelInfo.modelName
      )) as FeatureExtractionPipeline

      logger.log('Local embedding provider initialized')
    }
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    await this.init()
    const batches = chunkArray(texts, this.modelInfo.batchSize)

    const batchRequests = batches.map(batch => this.embeddingWithRetry(batch))
    const batchResponses = await Promise.all(batchRequests)

    return batchResponses.flat()
  }

  async embedQuery(text: string): Promise<number[]> {
    await this.init()
    const response = await this.embeddingWithRetry([text])
    return response[0]!
  }

  private async embeddingWithRetry(batch: string[]): Promise<number[][]> {
    if (!this.pipeline) {
      throw new Error('Pipeline not initialized')
    }

    return this.caller.call(async () => {
      try {
        const output = await this.pipeline!(batch, {
          pooling: 'mean',
          normalize: true
        })
        return output.tolist()
      } catch (e) {
        throw new Error(`Error during embedding: ${(e as Error).message}`)
      }
    })
  }

  dispose() {
    this.pipeline?.dispose()
    this.pipeline = null
  }
}
