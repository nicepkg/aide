import { CodebaseWatcherRegister } from '@extension/registers/codebase-watcher-register'
import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base-strategy'
import {
  type ChatGraphState,
  type CreateChatGraphNode
} from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/nodes/state'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import type { ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import type { ConversationLog, LangchainTool } from '@shared/entities'
import { PluginId } from '@shared/plugins/base/types'
import { mergeCodeSnippets } from '@shared/plugins/fs-plugin/server/merge-code-snippets'
import { settledPromiseResults } from '@shared/utils/common'
import { produce } from 'immer'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import type { CodeSnippet, FsPluginLog, FsPluginState } from '../../types'

interface CodebaseSearchToolResult {
  codeSnippets: CodeSnippet[]
}

export const createCodebaseSearchTool = async (
  options: BaseStrategyOptions,
  state: ChatGraphState
) => {
  const { conversations } = state.chatContext
  const lastConversation = conversations.at(-1)
  const fsPluginState = lastConversation?.pluginStates?.[PluginId.Fs] as
    | Partial<FsPluginState>
    | undefined

  if (!fsPluginState?.enableCodebaseAgent) return null

  const getSearchResults = async (
    state: ChatGraphState,
    queryParts?: string[]
  ): Promise<CodebaseSearchToolResult> => {
    const indexer = options.registerManager.getRegister(
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
    name: 'codebaseSearch',
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

export const createCodebaseSearchNode: CreateChatGraphNode =
  options => async state => {
    const { conversations } = state.chatContext
    const lastConversation = conversations.at(-1)
    const fsPluginState = lastConversation?.pluginStates?.[PluginId.Fs] as
      | Partial<FsPluginState>
      | undefined
    const logs: ConversationLog[] = []

    if (!fsPluginState?.enableCodebaseAgent) return {}

    const codebaseSearchTool = await createCodebaseSearchTool(options, state)

    if (!codebaseSearchTool) return {}

    const tools: LangchainTool[] = [codebaseSearchTool]
    const lastMessage = state.messages.at(-1)
    const toolCalls = findCurrentToolsCallParams(lastMessage, tools)

    if (!toolCalls.length) return {}

    const toolCallsPromises = toolCalls.map(async toolCall => {
      const toolMessage = (await codebaseSearchTool.invoke(
        toolCall
      )) as ToolMessage

      const result = JSON.parse(
        toolMessage?.lc_kwargs.content
      ) as CodebaseSearchToolResult

      lastConversation!.pluginStates![PluginId.Fs] = produce(
        lastConversation!.pluginStates![PluginId.Fs] as Partial<FsPluginState>,
        (draft: Partial<FsPluginState>) => {
          if (!draft.codeSnippetFromAgent) {
            draft.codeSnippetFromAgent = []
          }

          draft.codeSnippetFromAgent.push(...result.codeSnippets)
        }
      )

      logs.push({
        id: uuidv4(),
        createdAt: Date.now(),
        pluginId: PluginId.Fs,
        title: 'Search codebase',
        codeSnippets: result.codeSnippets
      } satisfies FsPluginLog)
    })

    await settledPromiseResults(toolCallsPromises)

    const newConversations = produce(state.newConversations, draft => {
      draft.at(-1)!.logs.push(...logs)
    })

    return {
      chatContext: state.chatContext,
      newConversations
    }
  }
