import { DocRetrieverAgent } from '../agents/doc-retriever-agent'
import { BaseToState } from '../base/base-to-state'
import { DocMentionType, type DocMention } from './types'

export class DocToState extends BaseToState<DocMention> {
  toMentionsState() {
    return {
      allowSearchDocSiteNames: this.getMentionDataByType(DocMentionType.Doc)
    }
  }

  toAgentsState() {
    return {
      relevantDocs: this.getAgentOutputsByKey<
        DocRetrieverAgent,
        'relevantDocs'
      >(DocRetrieverAgent.name, 'relevantDocs').flat()
    }
  }
}
