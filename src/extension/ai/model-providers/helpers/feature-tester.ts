import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { HumanMessage } from '@langchain/core/messages'
import type { AIModel, AIModelFeature } from '@shared/entities/ai-model-entity'
import type { MaybePromise } from 'mermaid/dist/types'
import { z } from 'zod'

import { imgUrlForTest, type BaseModelProvider } from './base'

export class FeatureTester {
  constructor(private baseModelProvider: BaseModelProvider<BaseChatModel>) {}

  async testChatSupport() {
    const supported = await this.baseModelProvider.testChatSupport()
    if (supported !== undefined) {
      return supported
    }

    try {
      const model = await this.baseModelProvider.getLangChainModel()
      await model.invoke('Hello, how are you?')
      return true
    } catch {
      return false
    }
  }

  async testToolsCallSupport() {
    const supported = await this.baseModelProvider.testToolsCallSupport()
    if (supported !== undefined) {
      return supported
    }

    try {
      const runnable =
        await this.baseModelProvider.createStructuredOutputRunnable({
          schema: z.object({
            operation: z
              .enum(['add', 'subtract', 'multiply', 'divide'])
              .describe('The type of operation to execute.'),
            number1: z.number().describe('First integer'),
            number2: z.number().describe('Second integer')
          }),
          useHistory: false
        })

      const res: {
        operation: string
        number1: number
        number2: number
      } = await runnable.invoke({ input: 'What is 2 times 2?' })

      return Boolean(
        res.operation === 'multiply' && res.number1 === 2 && res.number2 === 2
      )
    } catch {
      return false
    }
  }

  async testImageInputSupport() {
    const supported = await this.baseModelProvider.testImageInputSupport()
    if (supported !== undefined) {
      return supported
    }

    try {
      const model = await this.baseModelProvider.getLangChainModel()
      const message = new HumanMessage({
        content: [
          {
            type: 'text',
            text: 'describe the weather in this image'
          },
          {
            type: 'image_url',
            image_url: {
              url: imgUrlForTest
            }
          }
        ]
      })

      const response = await model.invoke([message])
      return !!response.content.length
    } catch {
      return false
    }
  }

  async testImageOutputSupport() {
    const supported = await this.baseModelProvider.testImageOutputSupport()
    if (supported !== undefined) {
      return supported
    }

    return false
  }

  async testAudioInputSupport() {
    const supported = await this.baseModelProvider.testAudioInputSupport()
    if (supported !== undefined) {
      return supported
    }

    return false
  }

  async testAudioOutputSupport() {
    const supported = await this.baseModelProvider.testAudioOutputSupport()
    if (supported !== undefined) {
      return supported
    }

    return false
  }

  async testModelFeatures(
    features: AIModelFeature[]
  ): Promise<Partial<AIModel>> {
    const results: Partial<AIModel> = {}
    const featureTestsMap: Record<AIModelFeature, () => MaybePromise<boolean>> =
      {
        chatSupport: this.testChatSupport.bind(this),
        toolsCallSupport: this.testToolsCallSupport.bind(this),
        imageInputSupport: this.testImageInputSupport.bind(this),
        imageOutputSupport: this.testImageOutputSupport.bind(this),
        audioInputSupport: this.testAudioInputSupport.bind(this),
        audioOutputSupport: this.testAudioOutputSupport.bind(this)
      }

    for (const feature of features) {
      results[feature] = await featureTestsMap[feature]()
    }

    return results
  }
}
