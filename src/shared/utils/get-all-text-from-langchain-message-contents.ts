import type { LangchainMessageContents } from '@extension/webview-api/chat-context-processor/types/langchain-message'

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
