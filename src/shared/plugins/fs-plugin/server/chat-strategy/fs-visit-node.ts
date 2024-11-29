/* eslint-disable unused-imports/no-unused-vars */
import { getValidFiles } from '@extension/file-utils/get-valid-files'
import type { FileInfo } from '@extension/file-utils/traverse-fs'
import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base-strategy'
import {
  dispatchChatGraphState,
  type ChatGraphState,
  type CreateChatGraphNode
} from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/nodes/state'
import { findCurrentToolsCallParams } from '@extension/webview-api/chat-context-processor/utils/find-current-tools-call-params'
import type { ToolMessage } from '@langchain/core/messages'
import { DynamicStructuredTool } from '@langchain/core/tools'
import type { ConversationLog, LangchainTool } from '@shared/entities'
import { PluginId } from '@shared/plugins/base/types'
import { settledPromiseResults } from '@shared/utils/common'
import { produce } from 'immer'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import type { FsPluginLog, FsPluginState } from '../../types'

interface FsVisitToolResult {
  files: FileInfo[]
}

export const createFsVisitTool = async (
  options: BaseStrategyOptions,
  state: ChatGraphState
) => {
  const getFileContents = async (
    relativePaths: string[]
  ): Promise<FsVisitToolResult> => {
    const files = await getValidFiles(relativePaths, {
      isGetFileContent: false
    })
    return {
      files
    }
  }

  return new DynamicStructuredTool({
    name: 'fsVisit',
    description:
      'A tool for directly accessing and reading specific files in the codebase.',
    func: async ({ relativePaths }): Promise<FsVisitToolResult> => {
      const result = await getFileContents(relativePaths)
      return result
    },
    schema: z.object({
      relativePaths: z
        .array(z.string())
        .describe(
          'An array of relative file paths to read from the workspace root'
        )
    })
  })
}

export const createFsVisitNode: CreateChatGraphNode =
  options => async state => {
    const { conversations } = state.chatContext
    const lastConversation = conversations.at(-1)
    const logs: ConversationLog[] = []
    const fsVisitTool = await createFsVisitTool(options, state)

    if (!fsVisitTool) return {}

    const tools: LangchainTool[] = [fsVisitTool]
    const lastMessage = state.messages.at(-1)
    const toolCalls = findCurrentToolsCallParams(lastMessage, tools)

    if (!toolCalls.length) return {}

    const toolCallsPromises = toolCalls.map(async toolCall => {
      const toolMessage = (await fsVisitTool.invoke(toolCall)) as ToolMessage

      const result = JSON.parse(
        toolMessage?.lc_kwargs.content
      ) as FsVisitToolResult

      lastConversation!.pluginStates![PluginId.Fs] = produce(
        lastConversation!.pluginStates![PluginId.Fs] as Partial<FsPluginState>,
        (draft: Partial<FsPluginState>) => {
          if (!draft.selectedFilesFromAgent) {
            draft.selectedFilesFromAgent = []
          }

          draft.selectedFilesFromAgent.push(...result.files)
        }
      )

      logs.push({
        id: uuidv4(),
        createdAt: Date.now(),
        pluginId: PluginId.Fs,
        title: 'Auto visit files',
        selectedFilesFromAgent: result.files
      } satisfies FsPluginLog)
    })

    await settledPromiseResults(toolCallsPromises)

    const newConversations = produce(state.newConversations, draft => {
      draft.at(-1)!.logs.push(...logs)
    })

    dispatchChatGraphState({
      newConversations,
      chatContext: state.chatContext
    })

    return {
      chatContext: state.chatContext,
      newConversations
    }
  }
