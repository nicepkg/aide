import type {
  MessageContentComplex,
  MessageContentImageUrl,
  MessageContentText
} from '@langchain/core/messages'

export class LangchainContentsManager {
  private messageContents: MessageContentComplex[]

  constructor(
    messageContents: string | MessageContentComplex | MessageContentComplex[]
  ) {
    this.messageContents = [{ type: 'text', text: '' }]

    if (messageContents) {
      this.mergeMessageContents(messageContents)
    }
  }

  appendText(text: string): void {
    const textContent = this.messageContents.find(
      content => content.type === 'text'
    ) as MessageContentText

    textContent.text += text
  }

  appendImage(url: string): void {
    this.messageContents.push({
      type: 'image_url',
      image_url: url
    } as MessageContentImageUrl)
  }

  mergeMessageContents(
    contents: string | MessageContentComplex | MessageContentComplex[]
  ): void {
    if (typeof contents === 'string') {
      this.appendText(`\n${contents}`)
    } else if (Array.isArray(contents)) {
      contents.forEach(param => this.mergeMessageContents(param))
    } else if (contents.type === 'text') {
      this.appendText(`\n${contents.text}`)
    } else if (contents.type === 'image_url') {
      this.appendImage(contents.image_url)
    }
  }

  getContents(): MessageContentComplex[] {
    return this.messageContents
  }
}
