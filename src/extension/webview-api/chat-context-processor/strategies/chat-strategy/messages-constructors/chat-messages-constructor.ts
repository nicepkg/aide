import type { ChatContext } from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { LangchainMessage } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { settledPromiseResults } from '@shared/utils/common'

import { CHAT_WITH_FILE_SYSTEM_PROMPT, COMMON_SYSTEM_PROMPT } from './constants'
import { ConversationMessageConstructor } from './conversation-message-constructor'

export class ChatMessagesConstructor {
  private chatContext: ChatContext

  constructor(chatContext: ChatContext) {
    this.chatContext = chatContext
  }

  async constructMessages(): Promise<LangchainMessage[]> {
    const hasAttachedFiles = this.checkForAttachedFiles()
    const systemMessage = this.createSystemMessage(hasAttachedFiles)
    const instructionMessage = this.createCustomInstructionMessage()
    const conversationMessages =
      await this.buildConversationMessages(hasAttachedFiles)

    return [systemMessage, instructionMessage, ...conversationMessages].filter(
      Boolean
    ) as LangchainMessage[]
  }

  private checkForAttachedFiles(): boolean {
    return this.chatContext.conversations.some(conversation => {
      const { selectedFiles = [], selectedFolders = [] } =
        conversation.attachments?.fileContext || {}
      const { relevantCodeSnippets = [] } =
        conversation.attachments?.codebaseContext || {}

      return (
        selectedFiles.length > 0 ||
        selectedFolders.length > 0 ||
        relevantCodeSnippets.length > 0
      )
    })
  }

  private createSystemMessage(hasAttachedFiles: boolean): SystemMessage {
    const content = hasAttachedFiles
      ? CHAT_WITH_FILE_SYSTEM_PROMPT
      : COMMON_SYSTEM_PROMPT

    return new SystemMessage({ content })
  }

  private createCustomInstructionMessage(): HumanMessage | null {
    const { explicitContext } = this.chatContext.settings
    if (!explicitContext) return null

    return new HumanMessage({
      content: `
Please also follow these instructions in all of your responses if relevant to my query. No need to acknowledge these instructions directly in your response.
<custom_instructions>
${explicitContext}
</custom_instructions>
      `
    })
  }

  private async buildConversationMessages(
    hasAttachedFiles: boolean
  ): Promise<LangchainMessage[]> {
    const messagePromises = this.chatContext.conversations.map(conversation =>
      new ConversationMessageConstructor(
        conversation,
        hasAttachedFiles
      ).buildMessages()
    )
    const messageArrays = await settledPromiseResults(messagePromises)
    return messageArrays.flat()
  }
}
