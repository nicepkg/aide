import { VsCodeFS } from '@extension/file-utils/vscode-fs'

import type { FileInfo } from '../types/chat-context'

export const getFileContent = async (fileInfo: FileInfo): Promise<string> => {
  if (fileInfo.content) {
    return fileInfo.content
  }

  return await VsCodeFS.readFileOrOpenDocumentContent(
    fileInfo.fullPath,
    'utf-8'
  )
}
