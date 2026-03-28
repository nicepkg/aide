import { getConfigKey } from '@extension/config'
import { getContext } from '@extension/context'
import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai'
import * as vscode from 'vscode'

import { parseModelBaseUrl } from '../parse-model-base-url'
import { BaseModelProvider } from './base'

export class MiniMaxModelProvider extends BaseModelProvider<
  ChatOpenAI<ChatOpenAICallOptions>
> {
  async createModel() {
    const isDev = getContext().extensionMode !== vscode.ExtensionMode.Production
    const { url: openaiBaseUrl } = await parseModelBaseUrl()
    const openaiKey = await getConfigKey('openaiKey')
    const openaiModel = await getConfigKey('openaiModel')

    // MiniMax requires temperature in (0.0, 1.0]
    const temperature = Math.min(Math.max(0.01, 0.95), 1.0)

    const model = new ChatOpenAI({
      apiKey: openaiKey,
      configuration: {
        baseURL: openaiBaseUrl || 'https://api.minimax.io/v1',
        fetch
      },
      model: openaiModel,
      temperature,
      maxRetries: 3,
      verbose: isDev
    })

    // MiniMax API does not support these OpenAI-specific parameters
    model.frequencyPenalty = undefined as any
    model.n = undefined as any
    model.presencePenalty = undefined as any
    model.topP = undefined as any

    return model
  }
}
