import { END, START, StateGraph } from '@langchain/langgraph'

import { combineNode } from '../../utils/combine-node'
import { agentNode } from './nodes/agent-node'
import { codebaseSearchNode } from './nodes/codebase-search-node'
import { docRetrieverNode } from './nodes/doc-retriever-node'
import { generateNode } from './nodes/generate-node'
import {
  ChatGraphNodeName,
  chatGraphState,
  type ChatGraphState
} from './nodes/state'
import { webSearchNode } from './nodes/web-search-node'
import { webVisitNode } from './nodes/web-visit-node'

const createSmartRoute =
  (nextNodeName: ChatGraphNodeName) => (state: ChatGraphState) =>
    state.shouldContinue ? nextNodeName : END

const chatWorkflow = new StateGraph(chatGraphState)
  .addNode(ChatGraphNodeName.Agent, agentNode)
  .addNode(
    ChatGraphNodeName.Tools,
    combineNode(
      [codebaseSearchNode, docRetrieverNode, webSearchNode, webVisitNode],
      chatGraphState
    )
  )
  .addNode(ChatGraphNodeName.Generate, generateNode)

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

export { chatWorkflow }
