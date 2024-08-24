import { HumanMessage, SystemMessage } from '@langchain/core/messages'

import type { ChatContext } from '../types/chat-context'
import type { LangchainMessageType } from '../types/langchain-message'
import { BasePlugin } from './base.plugin'

export class CodeChunksPlugin extends BasePlugin {
  name = 'CodeChunks'

  async buildContext(
    context: Partial<ChatContext>
  ): Promise<LangchainMessageType[]> {
    const conversation = context.conversation || []

    const codeChunks = conversation
      .filter(msg => msg.type === 'human')
      .flatMap(msg => msg.attachedCodeChunks || [])

    if (codeChunks.length === 0) return []

    const chunksContent = codeChunks
      .map(
        chunk =>
          `\`\`\`${chunk.languageIdentifier}:${chunk.relativeWorkspacePath}\n${chunk.lines.join(
            '\n'
          )}\n\`\`\``
      )
      .join('\n\n')

    return [
      new SystemMessage('Relevant code chunks:'),
      new HumanMessage(chunksContent)
    ]
  }
}
