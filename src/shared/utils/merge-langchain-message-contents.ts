import type { LangchainMessageContents } from '@shared/entities'

export const mergeLangchainMessageContents = (
  contents: LangchainMessageContents
): LangchainMessageContents => {
  const finalContents: LangchainMessageContents = []

  contents.forEach(content => {
    const lastContent = finalContents.at(-1)

    if (!lastContent) {
      finalContents.push(content)
      return
    }

    if (content.type === 'text' && lastContent.type === 'text') {
      lastContent.text += content.text
      finalContents[finalContents.length - 1] = lastContent
    } else {
      finalContents.push(content)
    }
  })

  return finalContents
}
