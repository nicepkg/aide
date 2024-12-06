import { ChatBubbleIcon, GearIcon } from '@radix-ui/react-icons'
import { ChatContextType, type ChatSession } from '@shared/entities'
import type {
  SearchCategory,
  SearchItem
} from '@webview/components/global-search/global-search'
import { useNavigate } from 'react-router'

import { useChatContext } from '../chat-context'
import { ChatSessionPreview } from './previews/chat-session-preview'
import { SettingPreview } from './previews/setting-preview'
import type { SearchResult, SearchSettingItem } from './types'

export const useSearchCategories = (
  searchResults: SearchResult[]
): SearchCategory[] => {
  const { switchSession } = useChatContext()
  const navigate = useNavigate()

  const getChatSessionResults = (results: SearchResult[]) =>
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
          renderPreview: () => <ChatSessionPreview chatSession={chatSession} />,
          onSelect: () => {
            navigate('/')
            switchSession(chatSession.id)
          }
        } satisfies SearchItem
      })

  const getSettingResults = (results: SearchResult[]) =>
    results
      .filter(result => result.type === 'setting')
      .map(result => {
        if (result.type !== 'setting') return null
        const setting = result.item as SearchSettingItem

        const breadcrumbs = setting.groupLabel
          ? [setting.groupLabel, setting.pageLabel]
          : [setting.pageLabel]

        return {
          id: setting.key,
          title: setting.renderOptions.label,
          description: setting.renderOptions.description,
          breadcrumbs,
          icon: <GearIcon className="!size-3" />,
          keywords: [setting.renderOptions.label],
          renderPreview: () => <SettingPreview setting={setting} />,
          onSelect: () => {
            navigate(`/settings?pageId=${setting.pageId}`)
          }
        } satisfies SearchItem
      })
      .filter(Boolean) as SearchItem[]

  return [
    {
      id: 'chatSessions',
      name: 'Chat History',
      items: getChatSessionResults(searchResults)
    },
    {
      id: 'settings',
      name: 'Settings',
      items: getSettingResults(searchResults)
    }
  ]
}
