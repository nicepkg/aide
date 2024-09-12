import { logger } from '@extension/logger'

import type { ChatContext } from '../types/chat-context'
import type {
  Attachments,
  Conversation
} from '../types/chat-context/conversation'
import type { ProcessorRegistry } from './processor-registry'

export class AttachmentProcessor {
  constructor(private processorRegistry: ProcessorRegistry) {}

  async processAttachments(
    conversation: Conversation,
    context: ChatContext
  ): Promise<string> {
    if (!conversation.attachments) return ''

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
        return acc + result.value
      }
      return acc
    }, '')
  }

  private async processAttachment(
    key: keyof Attachments,
    attachment: any,
    conversation: Conversation,
    context: ChatContext
  ): Promise<string | null> {
    const processor = this.processorRegistry.get(key)
    if (processor && attachment) {
      try {
        const params = await processor.buildMessageParams(
          attachment,
          conversation,
          context
        )
        return typeof params === 'string' ? params : (params.content as string)
      } catch (error) {
        logger.warn(`Error processing attachment ${key}:`, error)
        return null
      }
    }
    return null
  }
}
