import { CodebaseWatcherRegister } from '@extension/registers/codebase-watcher-register'
import { CodeSnippet } from '@extension/webview-api/chat-context-processor/types/chat-context/codebase-context'
import type { LangchainTool } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import { mergeCodeSnippets } from '@extension/webview-api/chat-context-processor/utils/merge-code-snippets'
import type { ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { settledPromiseResults } from '@shared/utils/common'
import { z } from 'zod'

import {
  ChatGraphToolName,
  type ChatGraphNode,
  type ChatGraphState
} from './state'

interface CodebaseSearchToolResult {
  codeSnippets: CodeSnippet[]
}

export const createCodebaseSearchTool = async (state: ChatGraphState) => {
  const { chatContext } = state
  const { conversations } = chatContext
  const lastConversation = conversations.at(-1)
  const codebaseContext = lastConversation?.attachments?.codebaseContext

  if (!codebaseContext || !codebaseContext.enableTool) return null

  const getSearchResults = async (
    state: ChatGraphState,
    queryParts?: string[]
  ): Promise<CodebaseSearchToolResult> => {
    const { registerManager } = state
    const indexer = registerManager.getRegister(
      CodebaseWatcherRegister
    )?.indexer
    const searchResults: CodebaseSearchToolResult = {
      codeSnippets: []
    }

    if (!indexer) return searchResults

    const searchPromisesResult = await settledPromiseResults(
      queryParts?.map(queryPart => indexer.searchSimilarRow(queryPart)) || []
    )

    const searchCodeSnippets: CodeSnippet[] = searchPromisesResult
      .flat()
      .map(row => {
        // eslint-disable-next-line unused-imports/no-unused-vars
        const { embedding, ...others } = row
        return { ...others, code: '' }
      })

    const mergedCodeSnippets = await mergeCodeSnippets(searchCodeSnippets, {
      mode: 'expanded'
    })

    return {
      ...searchResults,
      codeSnippets: mergedCodeSnippets
    }
  }

  return new DynamicStructuredTool({
    name: ChatGraphToolName.CodebaseSearch,
    description:
      'Search the codebase using vector embeddings. This tool breaks down the query into parts and finds relevant code snippets for each part. Use this when you need to find specific code implementations or understand how certain features are coded in the project.',
    func: async ({ queryParts }): Promise<CodebaseSearchToolResult> =>
      await getSearchResults(state, queryParts),
    schema: z.object({
      queryParts: z
        .array(
          z
            .string()
            .describe(
              'A list of code snippets or questions to search for in the codebase. Each item will be used to find relevant code through vector search.'
            )
        )
        .describe(
          "The AI should break down the user's query into multiple parts, each focusing on a specific aspect or concept. This allows for a more comprehensive search across the codebase."
        )
    })
  })
}

export const codebaseSearchNode: ChatGraphNode = async state => {
  const { messages, chatContext } = state
  const { conversations } = chatContext
  const lastConversation = conversations.at(-1)
  const codebaseContext = lastConversation?.attachments?.codebaseContext

  if (!codebaseContext || !codebaseContext.enableTool) return {}

  const codebaseSearchTool = await createCodebaseSearchTool(state)

  if (!codebaseSearchTool) return {}

  const tools: LangchainTool[] = [codebaseSearchTool]
  const lastMessage = messages.at(-1)
  const toolCalls = findCurrentToolsCallParams(lastMessage, tools)

  if (!toolCalls.length) return {}

  const toolCallsPromises = toolCalls.map(async toolCall => {
    const toolMessage = (await codebaseSearchTool.invoke(
      toolCall
    )) as ToolMessage

    const result = JSON.parse(
      toolMessage?.lc_kwargs.content
    ) as CodebaseSearchToolResult

    lastConversation.attachments!.codebaseContext.relevantCodeSnippets = [
      ...lastConversation.attachments!.codebaseContext.relevantCodeSnippets,
      ...result.codeSnippets
    ]
  })

  await settledPromiseResults(toolCallsPromises)

  return {
    chatContext
  }
}
