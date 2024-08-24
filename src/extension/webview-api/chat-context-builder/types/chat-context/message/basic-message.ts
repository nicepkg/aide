import type { MessageType } from '@langchain/core/messages'

import type { RichText } from '../rich-text'

export interface BasicMessage {
  /**
   * @example
   * '@index.ts @utils.ts @absolutePath @Web @vscode @ci: fix ci @types 优化一下'
   */
  text: string

  richText?: RichText

  /**
   * @example 'human'
   */
  type: MessageType

  /**
   * @example 'dd62428a-94d7-4cbe-a7fb-2b5a2510afg'
   */
  bubbleId: string
}
