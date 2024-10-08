import type { LangchainTool } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { DocCrawler } from '@extension/webview-api/chat-context-processor/utils/doc-crawler'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import type { ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { settledPromiseResults } from '@shared/utils/common'
import { ContextInfoSource } from '@webview/types/chat'
import { z } from 'zod'

import {
  ChatGraphToolName,
  type ChatGraphNode,
  type ChatGraphState
} from './state'

interface WebVisitToolResult {
  contents: { url: string; content: string }[]
}

// eslint-disable-next-line unused-imports/no-unused-vars
export const createWebVisitTool = async (state: ChatGraphState) => {
  const getPageContents = async (
    urls: string[]
  ): Promise<{ url: string; content: string }[]> => {
    const docCrawler = new DocCrawler(urls[0]!)
    const contents = await settledPromiseResults(
      urls.map(async url => ({
        url,
        content:
          (await docCrawler.getPageContent(url)) || 'Failed to retrieve content'
      }))
    )
    return contents
  }

  return new DynamicStructuredTool({
    name: ChatGraphToolName.WebVisit,
    description:
      'Visit specific web pages and retrieve their content. Use this tool when you need to access and analyze the content of one or more web pages.',
    func: async ({ urls }): Promise<WebVisitToolResult> => {
      const contents = await getPageContents(urls)
      return { contents }
    },
    schema: z.object({
      urls: z
        .array(z.string().url())
        .describe(
          'An array of URLs to visit and retrieve content from. Each URL should be a valid web address.'
        )
    })
  })
}

export const webVisitNode: ChatGraphNode = async state => {
  const { messages, chatContext } = state
  const { conversations } = chatContext
  const lastConversation = conversations.at(-1)
  const docContext = lastConversation?.attachments?.docContext

  if (!docContext) return {}

  const webVisitTool = await createWebVisitTool(state)

  if (!webVisitTool) return {}

  const tools: LangchainTool[] = [webVisitTool]
  const lastMessage = messages.at(-1)
  const toolCalls = findCurrentToolsCallParams(lastMessage, tools)

  if (!toolCalls.length) return {}

  const toolCallsPromises = toolCalls.map(async toolCall => {
    const toolMessage = (await webVisitTool.invoke(toolCall)) as ToolMessage

    const result = JSON.parse(
      toolMessage?.lc_kwargs.content
    ) as WebVisitToolResult

    lastConversation.attachments!.docContext.relevantDocs = [
      ...lastConversation.attachments!.docContext.relevantDocs,
      ...result.contents.map(item => ({
        path: item.url,
        content: item.content,
        source: ContextInfoSource.ToolNode
      }))
    ]
  })

  await settledPromiseResults(toolCallsPromises)

  return {
    chatContext
  }
}
