import type { FileInfo } from '@extension/file-utils/traverse-fs'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'

export const getFileContent = async (fileInfo: FileInfo): Promise<string> => {
  if (fileInfo.content) {
    return fileInfo.content
  }

  return await VsCodeFS.readFileOrOpenDocumentContent(
    fileInfo.fullPath,
    'utf-8'
  )
}
