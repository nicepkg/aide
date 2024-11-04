import {
  aiProviderConfigs,
  AIProviderType,
  type AIProvider
} from '@shared/entities'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

export const providerQueryKey = ['aiProviders']

export const getDefaultExtraFields = (type: AIProviderType) => {
  const config = aiProviderConfigs[type]
  if (!config) return {}
  return config.fields.reduce(
    (acc, field) => {
      if (field.defaultValue) {
        acc[field.key] = field.defaultValue
      }
      return acc
    },
    {} as Record<string, string>
  )
}

export const getDefaultProviderValues = (type: AIProviderType) =>
  ({
    id: uuidv4(),
    name: '',
    type,
    allowRealTimeModels: true,
    realTimeModels: [],
    manualModels: [],
    extraFields: getDefaultExtraFields(type),
    order: -1
  }) satisfies AIProvider

export const providerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(AIProviderType),
  extraFields: z.record(z.any())
}) satisfies z.ZodType<Pick<AIProvider, 'type' | 'name' | 'extraFields'>>
