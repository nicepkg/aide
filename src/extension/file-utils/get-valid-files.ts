import { getWorkspaceFolder } from '@extension/utils'
import { removeDuplicates } from '@shared/utils/common'

import {
  traverseFileOrFolders,
  type FileInfo,
  type TraverseOptions
} from './traverse-fs'

/**
 * Get all valid file paths from an array of file or folder paths
 * @param paths - Array of file or folder paths (can be relative or absolute)
 * @param workspacePath - Base workspace path for resolving relative paths
 * @returns Array of valid absolute files info
 */
export const getValidFiles = async (
  paths: string[],
  traverseOptions?: Partial<TraverseOptions<FileInfo>>
): Promise<FileInfo[]> => {
  // Use Set to avoid duplicates
  const files: FileInfo[] = []

  // Use traverseFileOrFolders to handle both files and folders
  await traverseFileOrFolders({
    type: 'file',
    filesOrFolders: paths,
    workspacePath: getWorkspaceFolder().uri.fsPath,
    ...traverseOptions,
    itemCallback: async fileInfo => {
      files.push(fileInfo)
    }
  })

  return removeDuplicates(files, ['fullPath'])
}

/**
 * Example usage:
 * const paths = [
 *   'src/file1.ts',           // relative path
 *   '/absolute/path/file2.ts', // absolute path
 *   'non-existent-file.ts',    // invalid path
 *   'src/folder',             // folder path
 * ]
 *
 * const validPaths = await getValidFilePaths(paths)
 * console.log(validPaths)
 * // Output: Array of valid absolute files info
 */
