import type { Conversation } from '@shared/types/chat-context'

export const getTitleFromConversations = (
  conversations: Conversation[],
  defaultTitle = 'New Chat'
) => {
  let firstHumanMessageText = ''

  conversations
    .filter(conversation => conversation.role === 'human')
    .forEach(conversation =>
      conversation.contents.forEach(content => {
        if (content.type === 'text' && !firstHumanMessageText) {
          firstHumanMessageText = content.text
        }
      })
    )

  return firstHumanMessageText || defaultTitle
}
