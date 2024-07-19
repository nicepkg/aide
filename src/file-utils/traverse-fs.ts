import * as path from 'path'
import type { MaybePromise } from '@/types'
import * as vscode from 'vscode'

import { getAllValidFiles } from './ignore-patterns'
import { VsCodeFS } from './vscode-fs'

export interface FileInfo {
  content: string
  relativePath: string
  fullPath: string
}

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
