import { AIProviderType, type AIProvider } from '@shared/entities'
import { z } from 'zod'

export const providerQueryKey = ['aiProviders']

export const providerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(AIProviderType),
  extraFields: z.record(z.any())
}) satisfies z.ZodType<Pick<AIProvider, 'type' | 'name' | 'extraFields'>>
