/* eslint-disable no-useless-escape */
import { getConfigKey } from '@extension/config'
import { t } from '@extension/i18n'
import {
  AzureChatOpenAI,
  ChatOpenAI,
  type ChatOpenAICallOptions
} from '@langchain/openai'

import { parseModelBaseUrl } from '../parse-model-base-url'
import { BaseModelProvider } from './base'

export class AzureOpenAIModelProvider extends BaseModelProvider<
  ChatOpenAI<ChatOpenAICallOptions>
> {
  async createModel() {
    const { url: openaiBaseUrl } = await parseModelBaseUrl()
    const openaiKey = await getConfigKey('openaiKey')

    const regex =
      /https:\/\/(.+?)\/openai\/deployments\/([^\/]+)(?:\/[^?]+)?\?api-version=(.+)/
    const match = openaiBaseUrl.match(regex)

    if (!match) throw new Error(t('error.invalidAzureOpenaiBaseUrl'))

    const azureOpenAIBasePath = `https://${match[1]}/openai/deployments`
    const azureOpenAIApiDeploymentName = match[2] || ''
    const azureOpenAIApiVersion = match[3] || ''

    // final request url example:
    // https://azure-llm.openai.azure.com/openai/deployments/text-embedding-ada-002/embeddings?api-version=2022-12-01
    // https://westeurope.api.microsoft.com/openai/deployments/[azureOpenAIApiDeploymentName]/chat/completions?api-version=[azureOpenAIApiVersion]
    // basePath is:
    // https://westeurope.api.microsoft.com/openai/deployments
    // so user need to configure modelApiBaseUrl to:
    // https://westeurope.api.microsoft.com/openai/deployments/[azureOpenAIApiDeploymentName]?api-version=[azureOpenAIApiVersion]
    // https://westeurope.api.microsoft.com/openai/deployments/gpt-4o-xxx/chat/completions?api-version=2024-07-15

    const model = new AzureChatOpenAI({
      azureOpenAIBasePath,
      azureOpenAIApiKey: openaiKey,
      azureOpenAIApiVersion,
      azureOpenAIApiDeploymentName,
      configuration: {
        fetch
      },
      temperature: 0.95, // never use 1.0, some models do not support it
      verbose: this.isDev,
      maxRetries: 3
    })
    ;('https://westeurope.api.microsoft.com/openai/deployments/devName/chat/completions?api-version=AVersion')
    return model
  }
}
