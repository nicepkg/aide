import type { IFileContext } from '@extension/webview-api/chat-context-builder/types/chat-context'

import { BaseContextManager } from './base.manager'

export class FileContextManager extends BaseContextManager<IFileContext> {
  constructor() {
    super({
      focusedFiles: [],
      suggestedFiles: [],
      newlyCreatedFiles: [],
      newlyCreatedFolders: [],
      deleteFileSuggestions: [],
      isReadingLongFile: false,
      hasAddedFiles: false,
      codeBlockData: {}
    })
  }
}
