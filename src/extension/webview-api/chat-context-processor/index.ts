import { createModelProvider } from '@extension/ai/helpers'
import type { AIMessage } from '@langchain/core/messages'

import { AttachmentProcessor } from './core/attachment-processor'
import { MessageBuilder } from './core/message-builder'
import { ProcessorRegistry } from './core/processor-registry'
import { ToolManager } from './core/tool-manager'
import { CodeProcessor } from './processors/code.processor'
import { CodebaseProcessor } from './processors/codebase.processor'
import { DocProcessor } from './processors/doc.processor'
import { FileProcessor } from './processors/file.processor'
import { GitProcessor } from './processors/git.processor'
import { WebProcessor } from './processors/web.processor'
import type { ChatContext } from './types/chat-context'
import type { Conversation } from './types/chat-context/conversation'
import type { AIModel } from './types/core'
import type { LangchainMessage } from './types/langchain-message'

export class ChatContextProcessor {
  private attachmentProcessor: AttachmentProcessor

  private toolManager: ToolManager

  constructor(private processorRegistry: ProcessorRegistry) {
    this.attachmentProcessor = new AttachmentProcessor(processorRegistry)
    this.toolManager = new ToolManager()
  }

  async getAIMessageAnswer(
    context: ChatContext,
    allowTools: boolean
  ): Promise<AIMessage> {
    const messages = await this.buildMessages(context)
    const modelProvider = await createModelProvider()
    const aiModelAbortController = new AbortController()
    const aiModel = await modelProvider.getModel()
    const lastConversation =
      context.conversations[context.conversations.length - 1]

    if (lastConversation && allowTools) {
      return this.processWithTools(
        context,
        lastConversation,
        messages,
        aiModel,
        aiModelAbortController
      )
    }

    return this.invokeModel(aiModel, messages, aiModelAbortController)
  }

  private async processWithTools(
    context: ChatContext,
    lastConversation: Conversation,
    messages: LangchainMessage[],
    aiModel: AIModel,
    aiModelAbortController: AbortController
  ): Promise<AIMessage> {
    const aiToolsInfoMap = await this.toolManager.buildConversationToolsInfoMap(
      context,
      lastConversation,
      this.processorRegistry
    )
    const aiTools = Object.values(aiToolsInfoMap).map(({ tool }) => tool)
    const aiModelWithTools = this.toolManager.bindToolsToModel(
      aiModel,
      aiTools,
      aiModelAbortController
    )
    const aiMessage = await aiModelWithTools.invoke(messages)

    if (!aiMessage.tool_calls?.length) {
      return aiMessage
    }

    const updatedContext = await this.toolManager.processToolCalls(
      aiMessage.tool_calls,
      aiToolsInfoMap,
      lastConversation,
      context
    )
    return this.getAIMessageAnswer(updatedContext, false)
  }

  private async invokeModel(
    aiModel: AIModel,
    messages: LangchainMessage[],
    aiModelAbortController: AbortController
  ): Promise<AIMessage> {
    return aiModel
      .bind({ signal: aiModelAbortController.signal })
      .invoke(messages)
  }

  async buildMessages(context: ChatContext): Promise<LangchainMessage[]> {
    return Promise.all(
      context.conversations.map(conversation =>
        this.processConversation(conversation, context)
      )
    )
  }

  private async processConversation(
    conversation: Conversation,
    context: ChatContext
  ): Promise<LangchainMessage> {
    const processedContent = await this.attachmentProcessor.processAttachments(
      conversation,
      context
    )
    const fullContent = processedContent + conversation.content

    return MessageBuilder.createMessage(conversation.role, {
      content: fullContent
    })
  }
}

export const createChatContextProcessor =
  async (): Promise<ChatContextProcessor> => {
    const registry = new ProcessorRegistry()
    registry.register('fileContext', new FileProcessor())
    registry.register('codeContext', new CodeProcessor())
    registry.register('webContext', new WebProcessor())
    registry.register('docContext', new DocProcessor())
    registry.register('gitContext', new GitProcessor())
    registry.register('codebaseContext', new CodebaseProcessor())

    return new ChatContextProcessor(registry)
  }
