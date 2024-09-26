import { BaseChannel, ConfiguredManagedValue } from '@langchain/langgraph'
import type { AnnotationRoot } from '@langchain/langgraph/dist/graph'

export type ToStateDefinition<T extends Record<string, any>> = {
  [K in keyof T]: BaseChannel | (() => BaseChannel) | ConfiguredManagedValue
}

// create AnnotationRoot type
export type CreateAnnotationRoot<T extends Record<string, any>> =
  AnnotationRoot<ToStateDefinition<T>>
