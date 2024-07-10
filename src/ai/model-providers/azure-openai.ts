/* eslint-disable no-useless-escape */
import { getConfigKey } from '@/config'
import { getContext } from '@/context'
import {
  AzureChatOpenAI,
  ChatOpenAI,
  type ChatOpenAICallOptions
} from '@langchain/openai'
import * as vscode from 'vscode'

import { BaseModelProvider } from './base'

export class AzureOpenAIModelProvider extends BaseModelProvider<
  ChatOpenAI<ChatOpenAICallOptions>
> {
  async createModel() {
    const isDev = getContext().extensionMode !== vscode.ExtensionMode.Production
    const openaiBaseUrl = await getConfigKey('openaiBaseUrl')
    const openaiKey = await getConfigKey('openaiKey')
    const openaiModel = await getConfigKey('openaiModel')

    const regex =
      /https:\/\/(.+?)\/openai\/deployments\/([^\/]+)(?:\/[^?]+)?\?api-version=(.+)/
    const match = openaiBaseUrl.match(regex)

    if (!match) throw new Error('Invalid Azure OpenAI API URL')

    const azureOpenAIBasePath = `https://${match[1]}/openai/deployments`
    const azureOpenAIApiDeploymentName = match[2] || ''
    const azureOpenAIApiVersion = match[3] || ''

    // final request url example:
    // https://westeurope.api.microsoft.com/openai/deployments/[azureOpenAIApiDeploymentName]/chat/completions?api-version=[azureOpenAIApiVersion]
    // basePath is:
    // https://westeurope.api.microsoft.com/openai/deployments
    // so user need to configure modelApiBaseUrl to:
    // https://westeurope.api.microsoft.com/openai/deployments/[azureOpenAIApiDeploymentName]?api-version=[azureOpenAIApiVersion]

    const model = new AzureChatOpenAI({
      azureOpenAIBasePath,
      azureOpenAIApiKey: openaiKey,
      azureOpenAIApiVersion,
      azureOpenAIApiDeploymentName,
      model: openaiModel,
      configuration: {
        fetch
      },
      temperature: 0.95, // never use 1.0, some models do not support it
      verbose: isDev,
      maxRetries: 3
    })
    ;('https://westeurope.api.microsoft.com/openai/deployments/devName/chat/completions?api-version=AVersion')
    return model
  }
}
