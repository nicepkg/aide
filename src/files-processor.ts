import * as path from 'path'
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
  const fileContent = await VsCodeFS.readFile(filePath, 'utf-8')
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
  fileCallback: (fileInfo: FileInfo) => Promise<T>
): Promise<T[]> => {
  const results: T[] = []

  await Promise.allSettled(
    filesOrFolders.map(async fileOrFolder => {
      const stat = await VsCodeFS.stat(fileOrFolder)

      if (stat.type === vscode.FileType.Directory) {
        const allFiles = await getAllValidFiles(fileOrFolder)

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
        const fileInfo = await getFileInfo(fileOrFolder, workspacePath)
        if (fileInfo) {
          results.push(await fileCallback(fileInfo))
        }
      }
    })
  )

  return results
}
