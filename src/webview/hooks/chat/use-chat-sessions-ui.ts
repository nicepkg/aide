import { useEffect } from 'react'
import { convertChatContextToChatSession } from '@shared/utils/convert-chat-context-to-chat-session'
import { useChatContext } from '@webview/contexts/chat-context'

export const useChatSessionsUI = () => {
  const { context, chatSessions, switchSession } = useChatContext()

  const isCurrentSessionInChatSessions =
    chatSessions?.some(session => session.id === context.id) ?? false

  const currentSession = convertChatContextToChatSession(context)

  const chatSessionForRender = (
    isCurrentSessionInChatSessions ? [...chatSessions]! : [currentSession]
  ).sort((a, b) => b.updatedAt - a.updatedAt)

  useEffect(() => {
    if (chatSessions?.length && !isCurrentSessionInChatSessions) {
      const lastSession = [...chatSessions].sort(
        (a, b) => b.updatedAt - a.updatedAt
      )[0]!
      switchSession(lastSession.id)
    }
  }, [chatSessions, isCurrentSessionInChatSessions, switchSession])

  return {
    chatSessionForRender
  }
}
