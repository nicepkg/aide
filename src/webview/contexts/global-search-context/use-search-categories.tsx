import { ChatBubbleIcon, GearIcon } from '@radix-ui/react-icons'
import { ChatContextType, type ChatSession } from '@shared/entities'
import type {
  SearchCategory,
  SearchItem
} from '@webview/components/global-search/global-search'
import type { SettingItem } from '@webview/components/settings/types'
import { useNavigate } from 'react-router'

import { useChatContext } from '../chat-context'
import type { SearchResult } from './types'

export const useSearchCategories = (
  searchResults: SearchResult[]
): SearchCategory[] => {
  const { switchSession } = useChatContext()
  const navigate = useNavigate()

  const renderChatSessionResults = (results: SearchResult[]) =>
    results
      .filter(result => result.type === 'chatSession')
      .map(result => {
        const chatSession = result.item as ChatSession

        const chatTypeMap: Record<ChatContextType, string> = {
          [ChatContextType.Chat]: 'Chat',
          [ChatContextType.Composer]: 'Composer',
          [ChatContextType.UIDesigner]: 'UI Designer',
          [ChatContextType.AutoTask]: 'Auto Task'
        }

        return {
          id: chatSession.id,
          title: chatSession.title,
          breadcrumbs: [chatTypeMap[chatSession.type], 'History'],
          icon: <ChatBubbleIcon className="!size-3" />,
          keywords: [chatSession.title],
          onSelect: () => {
            navigate('/')
            switchSession(chatSession.id)
          }
        } satisfies SearchItem
      })

  const renderSettingResults = (results: SearchResult[]) =>
    results
      .filter(result => result.type === 'setting')
      .map(result => {
        if (result.type !== 'setting') return null
        const setting = result.item as SettingItem
        const metadata = result.metadata!

        const breadcrumbs = metadata.groupName
          ? [metadata.groupName, metadata.categoryName]
          : [metadata.categoryName]

        return {
          id: setting.key,
          title: setting.label,
          description: setting.description,
          breadcrumbs,
          icon: <GearIcon className="!size-3" />,
          keywords: [setting.label],
          onSelect: () => {
            navigate(`/settings?category=${metadata.categoryId}`)
          }
        } satisfies SearchItem
      })
      .filter(Boolean) as SearchItem[]

  return [
    {
      id: 'chatSessions',
      name: 'Chat History',
      items: renderChatSessionResults(searchResults)
    },
    {
      id: 'settings',
      name: 'Settings',
      items: renderSettingResults(searchResults)
    }
  ]
}
