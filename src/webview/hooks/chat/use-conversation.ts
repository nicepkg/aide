import type { Conversation } from '@webview/types/chat'
import { useImmer } from 'use-immer'
import { v4 as uuidv4 } from 'uuid'

export const getDefaultConversationAttachments = () => ({
  codeContext: {
    codeChunks: [],
    tmpCodeChunk: []
  },
  codebaseContext: {
    relevantCodeSnippets: []
  },
  docContext: {
    enableTool: false,
    allowSearchDocSiteUrls: [],
    relevantDocs: []
  },
  fileContext: {
    selectedFiles: [],
    selectedFolders: [],
    selectedImages: []
  },
  gitContext: {
    gitCommits: [],
    gitDiffs: [],
    gitPullRequests: []
  },
  webContext: {
    enableTool: false,
    webSearchResults: []
  }
})

export const getDefaultConversation = (role: Conversation['role']) => ({
  id: uuidv4(),
  createdAt: Date.now(),
  role,
  content: '',
  attachments: getDefaultConversationAttachments()
})

export const useConversation = (
  role: Conversation['role'] = 'human',
  initConversation?: Conversation
) => {
  const [conversation, setConversation] = useImmer<Conversation>(
    initConversation ?? getDefaultConversation(role)
  )

  const resetConversation = () => {
    setConversation(getDefaultConversation(role))
  }

  return {
    conversation,
    setConversation,
    resetConversation
  }
}
