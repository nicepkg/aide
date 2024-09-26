/* eslint-disable prefer-destructuring */
import { logger } from '@extension/logger'
import { BinaryOperatorAggregate } from '@langchain/langgraph'

import type { CreateAnnotationRoot } from '../types/langgraph'

type GraphNode<GraphState extends Record<string, any>> = (
  state: GraphState
) => Promise<Partial<GraphState>>

export const combineNode = <GraphState extends Record<string, any>>(
  nodes: GraphNode<GraphState>[],
  stateDefinition: CreateAnnotationRoot<GraphState>
): GraphNode<GraphState> => {
  const combined: GraphNode<GraphState> = async state => {
    const promises = nodes.map(async node => await node(state))
    const promisesResults = await Promise.allSettled(promises)
    const keys = new Set<keyof GraphState>()
    const states: Partial<GraphState>[] = []

    promisesResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const partialState = result.value as Partial<GraphState>
        Object.keys(partialState).forEach(key =>
          keys.add(key as keyof GraphState)
        )
        states.push(partialState)
      } else {
        logger.warn(`Error in node ${index}:`, result.reason)
      }
    })

    const combinedResult = {} as Partial<GraphState>

    for (const _key in keys) {
      const key = _key as keyof GraphState
      const annotation = stateDefinition.spec[key]

      if (annotation instanceof BinaryOperatorAggregate) {
        const { operator } = annotation
        const values = states
          .map(state => state[key])
          .filter(v => v !== undefined) as GraphState[keyof GraphState][]

        if (values.length === 1) {
          combinedResult[key] = values[0]
        } else if (values.length > 1) {
          combinedResult[key] = values.reduce(
            (acc, curr) => operator(acc, curr),
            values[0]
          )
        }
      }
    }

    return combinedResult
  }

  return combined
}
