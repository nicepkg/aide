/* eslint-disable prefer-destructuring */
import { BinaryOperatorAggregate } from '@langchain/langgraph'
import { settledPromiseResults } from '@shared/utils/common'

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
    const states = await settledPromiseResults(promises)
    const keys = new Set<keyof GraphState>()

    states.forEach(partialState => {
      Object.keys(partialState).forEach(key =>
        keys.add(key as keyof GraphState)
      )
    })

    const combinedResult = {} as Partial<GraphState>

    for (const _key of keys) {
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
