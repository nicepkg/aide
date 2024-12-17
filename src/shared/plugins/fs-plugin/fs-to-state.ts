import { CodebaseSearchAgent } from '../agents/codebase-search-agent'
import { FsVisitAgent } from '../agents/fs-visit-agent'
import { BaseToState } from '../base/base-to-state'
import { FsMentionType, type FsMention } from './types'

export class FsToState extends BaseToState<FsMention> {
  toMentionsState() {
    return {
      selectedFiles: this.getMentionDataByType(FsMentionType.File),
      selectedFolders: this.getMentionDataByType(FsMentionType.Folder),
      selectedTrees: this.getMentionDataByType(FsMentionType.Tree),
      codeChunks: this.getMentionDataByType(FsMentionType.Code),
      enableCodebaseAgent: this.isMentionExit(FsMentionType.Codebase),
      editorErrors: this.getMentionDataByType(FsMentionType.Errors).flat()
    }
  }

  toAgentsState() {
    return {
      codeSnippets: this.getAgentOutputsByKey<
        CodebaseSearchAgent,
        'codeSnippets'
      >('codebaseSearch', 'codeSnippets').flat(),
      visitedFiles: this.getAgentOutputsByKey<FsVisitAgent, 'files'>(
        'fsVisit',
        'files'
      ).flat()
    }
  }
}
