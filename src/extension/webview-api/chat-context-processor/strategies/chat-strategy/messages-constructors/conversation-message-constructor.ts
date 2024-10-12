import { MessageBuilder } from '@extension/webview-api/chat-context-processor/utils/message-builder'
import { HumanMessage } from '@langchain/core/messages'
import type { ChatStrategyProvider } from '@shared/plugins/base/server/create-provider-manager'
import type { ChatContext } from '@shared/types/chat-context'
import type { Conversation } from '@shared/types/chat-context/conversation'
import type {
  LangchainMessage,
  LangchainMessageContents
} from '@shared/types/chat-context/langchain-message'

interface ConversationMessageConstructorOptions {
  chatContext: ChatContext
  conversation: Conversation
  chatStrategyProvider: ChatStrategyProvider
}

export class ConversationMessageConstructor {
  private chatContext: ChatContext

  private conversation: Conversation

  private chatStrategyProvider: ChatStrategyProvider

  constructor(options: ConversationMessageConstructorOptions) {
    this.chatContext = options.chatContext
    this.conversation = options.conversation
    this.chatStrategyProvider = options.chatStrategyProvider
  }

  async buildMessages(): Promise<LangchainMessage[]> {
    if (this.conversation.role !== 'human') {
      return [
        MessageBuilder.createMessage(
          this.conversation.role,
          this.conversation.contents
        )
      ].filter(Boolean) as LangchainMessage[]
    }

    const contextMessage = await this.buildContextMessage()
    const humanMessage = await this.buildHumanMessage()

    return [contextMessage, humanMessage].filter(Boolean) as LangchainMessage[]
  }

  private async buildContextMessage(): Promise<HumanMessage | null> {
    const prompt =
      (await this.chatStrategyProvider.buildContextMessagePrompt?.(
        this.conversation,
        this.chatContext
      )) || ''

    if (!prompt.trim()) return null

    return new HumanMessage({
      content: `
# Inputs

${prompt}
`
    })
  }

  private async buildHumanMessage(): Promise<HumanMessage> {
    const prompt =
      (await this.chatStrategyProvider.buildHumanMessagePrompt?.(
        this.conversation,
        this.chatContext
      )) || ''

    const endPrompt =
      (await this.chatStrategyProvider.buildHumanMessageEndPrompt?.(
        this.conversation,
        this.chatContext
      )) || ''

    const imageUrls =
      (await this.chatStrategyProvider.buildHumanMessageImageUrls?.(
        this.conversation,
        this.chatContext
      )) || []

    const imageContents: LangchainMessageContents =
      imageUrls.map(url => ({
        type: 'image_url',
        image_url: url
      })) || []

    let isEnhanced = false
    const enhancedContents: LangchainMessageContents =
      this.conversation.contents
        .map(content => {
          if (content.type === 'text' && !isEnhanced) {
            isEnhanced = true
            return {
              ...content,
              text: `
${prompt}
${content.text}
${endPrompt}
`
            }
          }
          return content
        })
        .concat(...imageContents)

    return new HumanMessage({ content: enhancedContents })
  }
}
