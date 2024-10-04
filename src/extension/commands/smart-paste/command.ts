import {
  createModelProvider,
  getCurrentSessionIdHistoriesMap
} from '@extension/ai/helpers'
import { streamingCompletionWriter } from '@extension/file-utils/stream-completion-writer'
import { getActiveEditor, getWorkspaceFolder } from '@extension/utils'
import type { BaseMessage } from '@langchain/core/messages'
import * as vscode from 'vscode'

import { BaseCommand } from '../base.command'
import { buildConvertChatMessages } from './build-convert-chat-messages'

export class SmartPasteCommand extends BaseCommand {
  get commandName(): string {
    return 'aide.smartPaste'
  }

  async run(): Promise<void> {
    const workspaceFolder = getWorkspaceFolder()
    const activeEditor = getActiveEditor()
    const currentFilePath = activeEditor.document.uri.fsPath

    // ai
    const modelProvider = await createModelProvider()
    const aiModelAbortController = new AbortController()
    const aiModel = (await modelProvider.getModel()).bind({
      signal: aiModelAbortController.signal
    })

    const sessionId = `smartPaste:${currentFilePath}}`
    const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()

    // TODO: remove and support continue generate in the future
    delete sessionIdHistoriesMap[sessionId]

    await streamingCompletionWriter({
      editor: activeEditor,
      onCancel() {
        aiModelAbortController.abort()
      },
      buildAiStream: async () => {
        const convertMessages = await buildConvertChatMessages({
          workspaceFolder,
          currentFilePath,
          selection: activeEditor.selection,
          abortController: aiModelAbortController
        })

        const history = await modelProvider.getHistory(sessionId)
        const historyMessages = await history.getMessages()
        const currentMessages: BaseMessage[] = convertMessages
        const aiStream = aiModel.stream([
          ...historyMessages,
          ...currentMessages
        ])
        history.addMessages(currentMessages)

        return aiStream
      }
    })

    // TODO: remove and support continue generate in the future
    delete sessionIdHistoriesMap[sessionId]
  }

  async dispose(): Promise<void> {
    const openDocumentPaths = new Set(
      vscode.workspace.textDocuments.map(doc => doc.uri.fsPath)
    )
    const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()

    Object.keys(sessionIdHistoriesMap).forEach(sessionId => {
      const path = sessionId.match(/^smartPaste:(.*)$/)?.[1]

      if (path && !openDocumentPaths.has(path)) {
        delete sessionIdHistoriesMap[sessionId]
      }
    })
  }
}
