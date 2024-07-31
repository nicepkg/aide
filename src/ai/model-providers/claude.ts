import { getConfigKey } from '@/config'
import { getContext } from '@/context'
import { ChatAnthropic } from '@langchain/anthropic'
import * as vscode from 'vscode'

import { parseModelBaseUrl } from '../parse-model-base-url'
import { BaseModelProvider } from './base'

export class AnthropicModelProvider extends BaseModelProvider<ChatAnthropic> {
  async createModel() {
    const isDev = getContext().extensionMode !== vscode.ExtensionMode.Production

    // anthropic@https://api.anthropic.com
    const { url: openaiBaseUrl } = await parseModelBaseUrl()
    const openaiKey = await getConfigKey('openaiKey')
    const openaiModel = await getConfigKey('openaiModel')

    const model = new ChatAnthropic({
      apiKey: openaiKey,
      anthropicApiUrl: openaiBaseUrl,
      clientOptions: {
        fetch
      },
      model: openaiModel,
      temperature: 0.95, // never use 1.0, some models do not support it
      maxRetries: 6,
      verbose: isDev
    })

    return model
  }
}
