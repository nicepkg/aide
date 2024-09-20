import type { LangchainTool } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import type { DocumentInterface } from '@langchain/core/documents'
import type { ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import type { VectorStoreRetriever } from '@langchain/core/vectorstores'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { z } from 'zod'

import {
  ChatGraphToolName,
  type ChatGraphNode,
  type ChatGraphState
} from './state'

interface DocRetrieverToolResult {
  relevantDocs: DocumentInterface<Record<string, any>>[]
}

export const createDocRetrieverTool = async (state: ChatGraphState) => {
  const { chatContext } = state
  const { conversations } = chatContext
  const lastConversation = conversations.at(-1)
  const docContext = lastConversation?.attachments?.docContext

  if (!docContext) return null

  const { allowSearchDocSiteUrls } = docContext

  if (!allowSearchDocSiteUrls.length) return null

  let _retriever: VectorStoreRetriever<MemoryVectorStore>

  const getRetriever = async () => {
    if (_retriever) return _retriever

    // TODO: Deep search
    const docs = await Promise.all(
      allowSearchDocSiteUrls.map(url => new CheerioWebBaseLoader(url).load())
    )
    const docsList = docs.flat()

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50
    })
    const docSplits = await textSplitter.splitDocuments(docsList)

    const vectorStore = await MemoryVectorStore.fromDocuments(
      docSplits,
      new OpenAIEmbeddings()
    )

    _retriever = vectorStore.asRetriever()

    return _retriever
  }

  return new DynamicStructuredTool({
    name: ChatGraphToolName.DocRetriever,
    description: 'Search and return information about question.',
    func: async ({ query }, runManager): Promise<DocRetrieverToolResult> => {
      const retriever = await getRetriever()

      return {
        relevantDocs: await retriever.invoke(
          query,
          runManager?.getChild('retriever')
        )
      }
    },
    schema: z.object({
      query: z.string().describe('query to look up in retriever')
    })
  })
}

export const docRetrieverNode: ChatGraphNode = async state => {
  const { messages, chatContext } = state
  const { conversations } = chatContext
  const lastConversation = conversations.at(-1)
  const docContext = lastConversation?.attachments?.docContext

  if (!docContext) return {}

  const docRetrieverTool = await createDocRetrieverTool(state)

  if (!docRetrieverTool) return {}

  const tools: LangchainTool[] = [docRetrieverTool]
  const lastMessage = messages.at(-1)
  const toolCalls = findCurrentToolsCallParams(lastMessage, tools)

  if (!toolCalls.length) return {}

  const toolCallsPromises = toolCalls.map(async toolCall => {
    const toolMessage = (await docRetrieverTool.invoke(toolCall)) as ToolMessage

    const result = JSON.parse(
      toolMessage?.lc_kwargs.content
    ) as DocRetrieverToolResult

    lastConversation.attachments!.docContext.relevantDocs = [
      ...lastConversation.attachments!.docContext.relevantDocs,
      ...result.relevantDocs.map(doc => ({
        path: doc.metadata?.filePath,
        content: doc.pageContent
      }))
    ]
  })

  await Promise.allSettled(toolCallsPromises)

  return {
    chatContext
  }
}
