import { getConfigKey } from '@/config'
import { getContext } from '@/context'
import { ChatOpenAI, type ChatOpenAICallOptions } from '@langchain/openai'
import * as vscode from 'vscode'

import { parseModelBaseUrl } from '../parse-model-base-url'
import { BaseModelProvider } from './base'

export class OpenAIModelProvider extends BaseModelProvider<
  ChatOpenAI<ChatOpenAICallOptions>
> {
  async createModel() {
    const isDev = getContext().extensionMode !== vscode.ExtensionMode.Production
    const { url: openaiBaseUrl } = await parseModelBaseUrl()
    const openaiKey = await getConfigKey('openaiKey')
    const openaiModel = await getConfigKey('openaiModel')

    const model = new ChatOpenAI({
      apiKey: openaiKey,
      configuration: {
        baseURL: openaiBaseUrl,
        fetch
      },
      model: openaiModel,
      temperature: 0.95, // never use 1.0, some models do not support it
      maxRetries: 3,
      verbose: isDev
    })

    // some third-party language models are not compatible with the openAI specification,
    // they do not support some parameters, and langchain takes the initiative to add these parameters,
    // resulting in request failure, so here you need to clear these parameters
    model.frequencyPenalty = undefined as any
    model.n = undefined as any
    model.presencePenalty = undefined as any
    model.topP = undefined as any

    return model
  }
}
