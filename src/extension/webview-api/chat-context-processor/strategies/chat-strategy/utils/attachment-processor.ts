import { logger } from '@extension/logger'
import type {
  Attachments,
  ChatContext,
  Conversation
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { LangchainMessageContents } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { mergeLangchainMessageContents } from '@shared/utils/merge-langchain-message-contents'

import type { ProcessorRegistry } from './processor-registry'

export class AttachmentProcessor {
  constructor(public processorRegistry: ProcessorRegistry) {}

  async processAttachments(
    conversation: Conversation,
    context: ChatContext
  ): Promise<LangchainMessageContents> {
    if (!conversation.attachments) return []

    const attachmentResults = await Promise.allSettled(
      Object.entries(conversation.attachments).map(([key, attachment]) =>
        this.processAttachment(
          key as keyof Attachments,
          attachment,
          conversation,
          context
        )
      )
    )

    return attachmentResults.reduce((acc, result) => {
      if (result.status === 'fulfilled' && result.value) {
        return mergeLangchainMessageContents(acc.concat(result.value))
      }
      return acc
    }, [] as LangchainMessageContents)
  }

  private async processAttachment(
    key: keyof Attachments,
    attachment: any,
    conversation: Conversation,
    context: ChatContext
  ): Promise<LangchainMessageContents | null> {
    const processor = this.processorRegistry.get(key)
    if (processor && attachment) {
      try {
        const contents = await processor.buildMessageContents(
          attachment,
          conversation,
          context
        )
        return contents
      } catch (error) {
        logger.warn(`Error processing attachment ${key}:`, error)
        return null
      }
    }
    return null
  }
}
