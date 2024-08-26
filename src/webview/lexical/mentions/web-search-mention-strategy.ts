import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context/conversation'
import type { WebSearchResult } from '@extension/webview-api/chat-context-processor/types/chat-context/web-context'
import type { IMentionStrategy } from '@webview/types/chat'

export class WebSearchMentionStrategy implements IMentionStrategy {
  type = 'webSearch'

  async getData(): Promise<WebSearchResult[]> {
    // 实现 Web 搜索的逻辑
    return []
  }

  updateAttachments(
    data: WebSearchResult,
    currentAttachments: Attachments
  ): Partial<Attachments> {
    return {
      webContext: {
        ...currentAttachments.webContext,
        searchResults: [
          ...(currentAttachments.webContext?.searchResults || []),
          data
        ]
      }
    }
  }
}
