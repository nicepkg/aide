import type { LangchainMessageContents } from '@shared/types/chat-context/langchain-message'

export const getAllTextFromLangchainMessageContents = (
  contents: LangchainMessageContents
): string =>
  contents
    .map(content => {
      if (content.type === 'text') {
        return content.text
      }
      return ''
    })
    .join('')
