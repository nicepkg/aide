import type { Agent, ChatContext } from '@shared/entities'

/**
 * Process all conversations in chatContext and collect AI agents for each human conversation
 * Returns a new ChatContext with updated conversations
 */
export const processConversationsWithAgents = (
  chatContext: ChatContext
): ChatContext => {
  const { conversations } = chatContext
  const updatedConversations = conversations.map((conv, index) => {
    // Return early if not human conversation
    if (conv.role !== 'human') return conv

    // Collect AI agents until next human message
    const aiAgents: Agent[] = []
    let i = index + 1

    while (i < conversations.length && conversations[i]!.role !== 'human') {
      if (conversations[i]!.role === 'ai') {
        aiAgents.push(...(conversations[i]!.agents || []))
      }
      i++
    }

    return {
      ...conv,
      agents: aiAgents
    }
  })

  return {
    ...chatContext,
    conversations: updatedConversations
  }
}
