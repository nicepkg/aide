import { ServerPluginRegister } from '@extension/registers/server-plugin-register'
import { END, START, StateGraph } from '@langchain/langgraph'

import { combineNode } from '../../utils/combine-node'
import type { BaseStrategyOptions } from '../base-strategy'
import { createAgentNode } from './nodes/agent-node'
import { createGenerateNode } from './nodes/generate-node'
import {
  ChatGraphNodeName,
  chatGraphState,
  type ChatGraphState
} from './nodes/state'

const createSmartRoute =
  (nextNodeName: ChatGraphNodeName) => (state: ChatGraphState) => {
    if (state.abortController?.signal.aborted) {
      return END
    }

    return state.shouldContinue ? nextNodeName : END
  }

export const createChatWorkflow = async (options: BaseStrategyOptions) => {
  const chatStrategyProvider = options.registerManager
    .getRegister(ServerPluginRegister)
    ?.serverPluginRegistry?.providerManagers.chatStrategy.mergeAll()

  const toolNodes =
    (await chatStrategyProvider?.buildLanggraphToolNodes?.(options)) || []

  const chatWorkflow = new StateGraph(chatGraphState)
    .addNode(ChatGraphNodeName.Agent, createAgentNode(options))
    .addNode(ChatGraphNodeName.Tools, combineNode(toolNodes, chatGraphState))
    .addNode(ChatGraphNodeName.Generate, createGenerateNode(options))

  chatWorkflow
    .addConditionalEdges(START, createSmartRoute(ChatGraphNodeName.Agent))
    .addConditionalEdges(
      ChatGraphNodeName.Agent,
      createSmartRoute(ChatGraphNodeName.Tools)
    )
    .addConditionalEdges(
      ChatGraphNodeName.Tools,
      createSmartRoute(ChatGraphNodeName.Generate)
    )
    .addEdge(ChatGraphNodeName.Generate, END)

  return chatWorkflow
}
