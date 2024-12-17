import type { MessageContentComplex } from '@langchain/core/messages'
import type { LangchainMessageContents } from '@shared/entities'

export const convertToLangchainMessageContents = (
  content:
    | string
    | MessageContentComplex[]
    | MessageContentComplex
    | undefined
    | null
): LangchainMessageContents => {
  const defaultContent: LangchainMessageContents = []

  if (!content) {
    return defaultContent
  }

  if (typeof content === 'string') {
    return [
      {
        type: 'text',
        text: content
      }
    ]
  }

  if (Object.prototype.hasOwnProperty.call(content, 'type')) {
    const _content = content as MessageContentComplex

    if (_content.type === 'text') {
      return [
        {
          type: 'text',
          text: _content.text
        }
      ]
    }

    if (_content.type === 'image_url') {
      return [
        {
          type: 'image_url',
          image_url: {
            url:
              typeof _content.image_url === 'string'
                ? _content.image_url
                : _content.image_url?.url,
            detail: _content?.image_url?.detail || undefined
          }
        }
      ]
    }
  }

  if (Array.isArray(content)) {
    return content
      .map(item => {
        const itemResult = convertToLangchainMessageContents(item)
        return itemResult
      })
      .flat()
  }

  return defaultContent
}
