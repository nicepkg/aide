import { createModelProvider } from '@extension/ai/helpers'
import { LangchainContentsManager } from '@extension/webview-api/chat-context-processor/core/content-manager'
import { MessageBuilder } from '@extension/webview-api/chat-context-processor/core/message-builder'
import type {
  ChatContext,
  Conversation
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { AIModel } from '@extension/webview-api/chat-context-processor/types/core'
import type { LangchainMessage } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { convertToIterableReadableStream } from '@extension/webview-api/chat-context-processor/utils/convert-to-iterable-readable-stream'
import {
  HumanMessage,
  SystemMessage,
  type AIMessage
} from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'
import { mergeLangchainMessageContents } from '@shared/utils/merge-langchain-message-contents'

import type { BaseStrategy } from '../base-strategy'
import { CodeProcessor } from './processors/code-processor'
import { CodebaseProcessor } from './processors/codebase-processor'
import { DocProcessor } from './processors/doc-processor'
import { FileProcessor } from './processors/file-processor'
import { GitProcessor } from './processors/git-processor'
import { WebProcessor } from './processors/web-processor'
import { AttachmentProcessor } from './utils/attachment-processor'
import { ProcessorRegistry } from './utils/processor-registry'
import { ToolManager } from './utils/tool-manager'

export class ChatStrategy implements BaseStrategy {
  private attachmentProcessor: AttachmentProcessor

  private toolManager: ToolManager

  constructor() {
    const registry = new ProcessorRegistry()
    registry.register('webContext', new WebProcessor())
    registry.register('docContext', new DocProcessor())
    registry.register('gitContext', new GitProcessor())
    registry.register('codebaseContext', new CodebaseProcessor())
    registry.register('codeContext', new CodeProcessor())
    registry.register('fileContext', new FileProcessor())
    this.attachmentProcessor = new AttachmentProcessor(registry)
    this.toolManager = new ToolManager()
  }

  createSystemMessage(context: ChatContext): SystemMessage {
    const commonPrompt = `
You are an intelligent programmer, powered by GPT-4. You are happy to help answer any questions that the user has (usually they will be about coding). You will be given the context of the code in their file(s) and potentially relevant blocks of code.

1. Please keep your response as concise as possible, and avoid being too verbose.

2. Do not lie or make up facts.

3. If a user messages you in a foreign language, please respond in that language.

4. Format your response in markdown.

5. When referencing code blocks in your answer, keep the following guidelines in mind:

  a. Never include line numbers in the output code.

  b. When outputting new code blocks, please specify the language ID after the initial backticks:
\`\`\`python
{{ code }}
\`\`\`

  c. When outputting code blocks for an existing file, include the file path after the initial backticks:
\`\`\`python:src/backend/main.py
{{ code }}
\`\`\`

  d. When referencing a code block the user gives you, only reference the start and end line numbers of the relevant code:
\`\`\`typescript:app/components/Todo.tsx
startLine: 2
endLine: 30
\`\`\`
`

    const chatWithFilePrompt = `
You are an intelligent programmer, powered by GPT-4o. You are happy to help answer any questions that the user has (usually they will be about coding).

1. Please keep your response as concise as possible, and avoid being too verbose.

2. When the user is asking for edits to their code, please output a simplified version of the code block that highlights the changes necessary and adds comments to indicate where unchanged code has been skipped. For example:
\`\`\`file_path
// ... existing code ...
{{ edit_1 }}
// ... existing code ...
{{ edit_2 }}
// ... existing code ...
\`\`\`
The user can see the entire file, so they prefer to only read the updates to the code. Often this will mean that the start/end of the file will be skipped, but that's okay! Rewrite the entire file only if specifically requested. Always provide a brief explanation of the updates, unless the user specifically requests only the code.

3. Do not lie or make up facts.

4. If a user messages you in a foreign language, please respond in that language.

5. Format your response in markdown.

6. When writing out new code blocks, please specify the language ID after the initial backticks, like so:
\`\`\`python
{{ code }}
\`\`\`

7. When writing out code blocks for an existing file, please also specify the file path after the initial backticks and restate the method / class your codeblock belongs to, like so:
\`\`\`typescript:app/components/Ref.tsx
function AIChatHistory() {
    ...
    {{ code }}
    ...
}
\`\`\`
`

    const isChatWithFile = context.conversations.some(conversation => {
      const { selectedFiles = [], selectedFolders = [] } =
        conversation.attachments?.fileContext || {}
      return selectedFiles.length > 0 || selectedFolders.length > 0
    })

    return new SystemMessage({
      content: isChatWithFile ? chatWithFilePrompt : commonPrompt
    })
  }

  createUserInstructionMessage(context: ChatContext): HumanMessage | null {
    const { explicitContext } = context.settings

    return new HumanMessage({
      content: `
Please also follow these instructions in all of your responses if relevant to my query. No need to acknowledge these instructions directly in your response.
<custom_instructions>
${explicitContext}
</custom_instructions>
`
    })
  }

  async createConversationMessage(
    conversation: Conversation,
    context: ChatContext
  ): Promise<LangchainMessage> {
    const processedContents = await this.attachmentProcessor.processAttachments(
      conversation,
      context
    )

    const fullContents = mergeLangchainMessageContents(
      processedContents.concat(conversation.contents)
    )

    return MessageBuilder.createMessage(conversation.role, fullContents)
  }

  async buildMessages(context: ChatContext): Promise<LangchainMessage[]> {
    const conversationMessages = await Promise.all(
      context.conversations.map(conversation =>
        this.createConversationMessage(conversation, context)
      )
    )

    const systemMessage = this.createSystemMessage(context)
    const userInstructionMessage = this.createUserInstructionMessage(context)

    const messages = [
      systemMessage,
      userInstructionMessage,
      ...conversationMessages
    ].filter(Boolean) as LangchainMessage[]

    const lastMessage = messages[messages.length - 1]
    const isAskingFile = true

    if (lastMessage?.toDict().type === 'human' && isAskingFile) {
      const contentsManager = new LangchainContentsManager(lastMessage.content)
      contentsManager.appendText(`

If you need to reference any of the code blocks I gave you, only output the start and end line numbers. For example:
\`\`\`typescript:app/components/Todo.tsx
startLine: 200
endLine: 310
\`\`\`

If you are writing code, do not include the "line_number|" before each line of code.
        `)
      lastMessage.content = contentsManager.getContents()
    }

    return messages
  }

  async getAnswers(
    context: ChatContext,
    allowTools: boolean = true
  ): Promise<IterableReadableStream<AIMessage>> {
    console.log('context', context)
    const messages = await this.buildMessages(context)
    console.log('messages', messages)
    const modelProvider = await createModelProvider()
    const aiModelAbortController = new AbortController()
    const aiModel = await modelProvider.getModel()
    const lastHumanConversation =
      context.conversations[context.conversations.length - 1]

    if (lastHumanConversation && allowTools) {
      return this.getAnswersWithTools(
        context,
        lastHumanConversation,
        messages,
        aiModel,
        aiModelAbortController
      )
    }

    return this.getStreamAnswer(aiModel, messages, aiModelAbortController)
  }

  async getAnswersWithTools(
    context: ChatContext,
    lastHumanConversation: Conversation,
    messages: LangchainMessage[],
    aiModel: AIModel,
    aiModelAbortController: AbortController
  ): Promise<IterableReadableStream<AIMessage>> {
    const aiToolsInfoMap = await this.toolManager.buildConversationToolsInfoMap(
      context,
      lastHumanConversation,
      this.attachmentProcessor.processorRegistry
    )
    const aiTools = Object.values(aiToolsInfoMap).map(({ tool }) => tool)
    const aiModelWithTools = aiModel.bindTools!(aiTools).bind({
      signal: aiModelAbortController.signal
    })
    const aiMessage = await aiModelWithTools.invoke(messages)

    if (!aiMessage.tool_calls?.length) {
      return convertToIterableReadableStream(aiMessage)
    }

    const updatedContext = await this.toolManager.updateContextByToolCalls(
      aiMessage.tool_calls,
      aiToolsInfoMap,
      lastHumanConversation,
      context
    )

    return await this.getAnswers(updatedContext, false)
  }

  async getStreamAnswer(
    aiModel: AIModel,
    messages: LangchainMessage[],
    aiModelAbortController: AbortController
  ): Promise<IterableReadableStream<AIMessage>> {
    return aiModel
      .bind({ signal: aiModelAbortController.signal })
      .stream(messages)
  }
}
