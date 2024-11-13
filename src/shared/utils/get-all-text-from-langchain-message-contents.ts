import type { LangchainMessageContents } from '@shared/entities'

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
