/* eslint-disable prefer-destructuring */
import { getConfigKey } from '@/config'
import { t } from '@/i18n'

export type ModelUrlType = 'openai' | 'azure-openai'
export const parseModelBaseUrl = async (): Promise<{
  urlType: ModelUrlType
  url: string
}> => {
  // https://api.openai.com/v1
  // openai@https://api.openai.com/v1
  // azure-openai@https://westeurope.api.microsoft.com/openai/deployments/[azureOpenAIApiDeploymentName]
  // copilot
  // Fetch the baseUrl from the config
  const baseUrl = await getConfigKey('openaiBaseUrl')

  // Default values
  let urlType: ModelUrlType = 'openai'
  let url = ''

  // Use regexp to parse the urlType
  const regex = /^(openai|azure-openai|copilot)?@?(https?:\/\/[^\s]+)?$/
  const match = baseUrl.trim().match(regex)

  if (match) {
    if (match[1]) {
      urlType = match[1] as ModelUrlType
    }
    if (match[2]) {
      url = match[2]
    }
  } else {
    throw new Error(t('error.invalidBaseUrl'))
  }

  return { urlType, url }
}
