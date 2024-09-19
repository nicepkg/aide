import type { LangchainMessageContents } from '@extension/webview-api/chat-context-processor/types/langchain-message'

export const mergeStreamLangchainMessageContents = (
  sourceContents: LangchainMessageContents,
  streamContents: LangchainMessageContents
): LangchainMessageContents => {
  const finalContents: LangchainMessageContents = [...sourceContents]

  streamContents.forEach((streamContent, i) => {
    if (streamContent.type === 'text') {
      const sourceContent = sourceContents[i]

      if (sourceContent ? sourceContent.type === 'text' : true) {
        finalContents[i] = {
          type: 'text',
          text: ((sourceContent as any)?.text || '') + streamContent.text
        }
      }
    }
  })

  return finalContents
}
