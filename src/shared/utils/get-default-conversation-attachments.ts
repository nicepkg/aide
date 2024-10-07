import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context'

export const getDefaultConversationAttachments = (): Attachments => ({
  codeContext: {
    codeChunks: []
  },
  codebaseContext: {
    enableTool: false,
    relevantCodeSnippets: []
  },
  docContext: {
    allowSearchDocSiteNames: [],
    relevantDocs: []
  },
  fileContext: {
    selectedFiles: [],
    selectedFolders: [],
    selectedImages: [],
    currentFiles: []
  },
  gitContext: {
    gitCommits: [],
    gitDiffs: []
  },
  webContext: {
    enableTool: false,
    webSearchResults: []
  }
})
