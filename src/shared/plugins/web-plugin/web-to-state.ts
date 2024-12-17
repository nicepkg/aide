import { WebSearchAgent } from '../agents/web-search-agent'
import type { WebVisitAgent } from '../agents/web-visit-agent'
import { BaseToState } from '../base/base-to-state'
import { WebMentionType, type WebMention } from './types'

export class WebToState extends BaseToState<WebMention> {
  toMentionsState() {
    return {
      enableWebSearchAgent: this.isMentionExit(WebMentionType.Web),
      enableWebVisitAgent: this.isMentionExit(WebMentionType.Web)
    }
  }

  toAgentsState() {
    return {
      webSearchRelevantContent: this.getAgentOutputsByKey<
        WebSearchAgent,
        'relevantContent'
      >(WebSearchAgent.name, 'relevantContent').flat(),
      webVisitContents: this.getAgentOutputsByKey<WebVisitAgent, 'contents'>(
        'webVisit',
        'contents'
      ).flat()
    }
  }
}
