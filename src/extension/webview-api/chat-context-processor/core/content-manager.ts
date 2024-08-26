import type {
  MessageContentComplex,
  MessageContentImageUrl,
  MessageContentText
} from '@langchain/core/messages'

import type { LangchainMessageParams } from '../types/langchain-message'

export class ContentManager {
  private messageContent: MessageContentComplex[]

  constructor() {
    this.messageContent = [{ type: 'text', text: '' }]
  }

  appendText(text: string): void {
    const textContent = this.messageContent[0] as MessageContentText
    textContent.text += text
  }

  appendImage(url: string): void {
    this.messageContent.push({
      type: 'image_url',
      image_url: url
    } as MessageContentImageUrl)
  }

  mergeMessageParams(params: LangchainMessageParams): void {
    if (typeof params === 'string') {
      this.appendText(`\n${params}`)
    } else if (typeof params.content === 'string') {
      this.appendText(`\n${params.content}`)
    } else {
      params.content.forEach(content => {
        if (content.type === 'text') {
          this.appendText(content.text)
        } else if (content.type === 'image_url') {
          this.appendImage(content.image_url)
        }
      })
    }
  }

  getContent(): MessageContentComplex[] {
    return this.messageContent
  }
}
