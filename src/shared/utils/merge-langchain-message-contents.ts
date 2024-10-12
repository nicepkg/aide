import type { LangchainMessageContents } from '@shared/types/chat-context/langchain-message'

export const mergeLangchainMessageContents = (
  contents: LangchainMessageContents
): LangchainMessageContents => {
  let finalText = ''
  const otherContents: LangchainMessageContents = []

  contents.forEach(content => {
    if (content.type === 'text') {
      finalText += content.text
    } else {
      otherContents.push(content)
    }
  })

  return [
    {
      type: 'text',
      text: finalText
    },
    ...otherContents
  ]
}
