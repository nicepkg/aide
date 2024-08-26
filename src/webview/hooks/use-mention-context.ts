import { useCallback, useState } from 'react'
import { useChatContext } from '@webview/contexts/chat-context'

import { allMentionStrategies } from '../lexical/mentions'

export function useMentionContext() {
  const { currentAttachments, updateCurrentAttachments } = useChatContext()
  const [activeMentionType, setActiveMentionType] = useState<string | null>(
    null
  )

  const handleMentionSelect = useCallback(
    (type: string, data: any) => {
      const strategy = allMentionStrategies.find(s => s.type === type)
      if (strategy) {
        const updatedAttachments = strategy.updateAttachments(
          data,
          currentAttachments
        )
        updateCurrentAttachments(updatedAttachments)
      }
      setActiveMentionType(null)
    },
    [currentAttachments, updateCurrentAttachments]
  )

  return {
    activeMentionType,
    setActiveMentionType,
    handleMentionSelect
  }
}
