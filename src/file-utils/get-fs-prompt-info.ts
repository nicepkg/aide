import path from 'path'
import { t } from '@/i18n'

import { traverseFileOrFolders, type FileInfo } from './traverse-fs'

export interface FsPromptInfo {
  promptFullContent: string
  filesInfo: FileInfo[]
}

export const getFileOrFoldersPromptInfo = async (
  fileOrFolders: string[],
  workspacePath: string
): Promise<FsPromptInfo> => {
  const result: FsPromptInfo = {
    promptFullContent: '',
    filesInfo: []
  }

  const processFile = async (fileInfo: FileInfo) => {
    const { fullPath, relativePath, content } = fileInfo
    const language = path.extname(fullPath).slice(1)

    const promptFullContent = t(
      'file.content',
      relativePath,
      language,
      content.toString()
    )

    result.filesInfo.push(fileInfo)
    result.promptFullContent += promptFullContent
  }

  await traverseFileOrFolders(fileOrFolders, workspacePath, processFile)

  return result
}
