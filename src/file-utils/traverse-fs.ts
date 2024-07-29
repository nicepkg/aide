import * as path from 'path'
import type { MaybePromise } from '@/types'
import * as vscode from 'vscode'

import { getAllValidFiles } from './ignore-patterns'
import { VsCodeFS } from './vscode-fs'

/**
 * Represents information about a file.
 */
export interface FileInfo {
  /**
   * The content of the file.
   */
  content: string

  /**
   * The relative path of the file.
   */
  relativePath: string

  /**
   * The full path of the file.
   */
  fullPath: string
}

/**
 * Retrieves information about a file.
 * @param filePath - The path of the file.
 * @param workspacePath - The path of the workspace.
 * @returns A Promise that resolves to the file information, or null if the file does not exist.
 */
const getFileInfo = async (
  filePath: string,
  workspacePath: string
): Promise<FileInfo | null> => {
  const fileContent = await VsCodeFS.readFileOrOpenDocumentContent(
    filePath,
    'utf-8'
  )
  const relativePath = path.relative(workspacePath, filePath)

  return {
    content: fileContent,
    relativePath,
    fullPath: filePath
  }
}

/**
 * Traverses through an array of file or folder paths and performs a callback function on each file.
 * Returns an array of results from the callback function.
 *
 * @param filesOrFolders - An array of file or folder paths.
 * @param workspacePath - The path of the workspace.
 * @param fileCallback - The callback function to be performed on each file.
 * @returns An array of results from the callback function.
 */
export const traverseFileOrFolders = async <T>(
  filesOrFolders: string[],
  workspacePath: string,
  fileCallback: (fileInfo: FileInfo) => MaybePromise<T>
): Promise<T[]> => {
  const results: T[] = []

  await Promise.allSettled(
    filesOrFolders.map(async fileOrFolder => {
      // Convert relative path to absolute path
      const absolutePath = path.isAbsolute(fileOrFolder)
        ? fileOrFolder
        : path.join(workspacePath, fileOrFolder)
      const stat = await VsCodeFS.stat(absolutePath)

      if (stat.type === vscode.FileType.Directory) {
        const allFiles = await getAllValidFiles(absolutePath)

        await Promise.allSettled(
          allFiles.map(async filePath => {
            const fileInfo = await getFileInfo(filePath, workspacePath)
            if (fileInfo) {
              results.push(await fileCallback(fileInfo))
            }
          })
        )
      }

      if (stat.type === vscode.FileType.File) {
        const fileInfo = await getFileInfo(absolutePath, workspacePath)

        if (fileInfo) {
          results.push(await fileCallback(fileInfo))
        }
      }
    })
  )

  return results
}
