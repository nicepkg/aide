import type { LangchainMessageContents } from '@extension/webview-api/chat-context-processor/types/langchain-message'

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
