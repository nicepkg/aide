import path from 'path'
import { t } from '@/i18n'

import { traverseFileOrFolders, type FileInfo } from './traverse-fs'

/**
 * Represents the information required for a file system prompt.
 */
export interface FsPromptInfo {
  /**
   * The full content of the prompt.
   */
  promptFullContent: string

  /**
   * An array of file information.
   */
  filesInfo: FileInfo[]
}

/**
 * Retrieves the prompt information for a given array of files or folders.
 * @param fileOrFolders - The array of file or folder paths.
 * @param workspacePath - The path of the workspace.
 * @returns A promise that resolves to the `FsPromptInfo` object containing the prompt information.
 */
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
