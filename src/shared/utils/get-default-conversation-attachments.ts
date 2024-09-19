import type { Attachments } from '@extension/webview-api/chat-context-processor/types/chat-context'

export const getDefaultConversationAttachments = (): Attachments => ({
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
