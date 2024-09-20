import { END, START, StateGraph } from '@langchain/langgraph'

import { agentNode } from './nodes/agent-node'
import { docRetrieverNode } from './nodes/doc-retriever-node'
import { generateNode } from './nodes/generate-node'
import {
  ChatGraphNodeName,
  chatGraphState,
  type ChatGraphState
} from './nodes/state'
import { webSearchNode } from './nodes/web-search-node'

const createSmartRoute =
  (nextNodeName: ChatGraphNodeName) => (state: ChatGraphState) =>
    state.shouldContinue ? nextNodeName : END

const chatWorkflow = new StateGraph(chatGraphState)
  .addNode(ChatGraphNodeName.Agent, agentNode)
  .addNode(ChatGraphNodeName.DocRetrieve, docRetrieverNode)
  .addNode(ChatGraphNodeName.WebSearch, webSearchNode)
  .addNode(ChatGraphNodeName.Generate, generateNode)

// chatWorkflow
//   .addEdge(START, ChatGraphNodeName.Agent)
//   .addEdge(ChatGraphNodeName.Agent, ChatGraphNodeName.DocRetrieve)
//   .addEdge(ChatGraphNodeName.DocRetrieve, ChatGraphNodeName.WebSearch)
//   .addEdge(ChatGraphNodeName.WebSearch, ChatGraphNodeName.Generate)
//   .addEdge(ChatGraphNodeName.Generate, END)

chatWorkflow
  .addConditionalEdges(START, createSmartRoute(ChatGraphNodeName.Agent))
  .addConditionalEdges(
    ChatGraphNodeName.Agent,
    createSmartRoute(ChatGraphNodeName.DocRetrieve)
  )
  .addConditionalEdges(
    ChatGraphNodeName.DocRetrieve,
    createSmartRoute(ChatGraphNodeName.WebSearch)
  )
  .addConditionalEdges(
    ChatGraphNodeName.WebSearch,
    createSmartRoute(ChatGraphNodeName.Generate)
  )
  .addEdge(ChatGraphNodeName.Generate, END)

export { chatWorkflow }
