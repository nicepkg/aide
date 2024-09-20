import * as path from 'path'
import type { MaybePromise } from '@extension/types/common'
import * as vscode from 'vscode'

import { getAllValidFiles, getAllValidFolders } from './ignore-patterns'
import { VsCodeFS } from './vscode-fs'

export interface FileInfo {
  type: 'file'
  content: string // if isGetFileContent is false, content will be empty
  relativePath: string
  fullPath: string
}

export interface FolderInfo {
  type: 'folder'
  relativePath: string
  fullPath: string
}

type FsType = 'file' | 'folder'

interface TraverseOptions<T, Type extends FsType = 'file'> {
  type: Type
  filesOrFolders: string[]
  isGetFileContent?: boolean // default is true
  workspacePath: string
  itemCallback: (
    itemInfo: Type extends 'file' ? FileInfo : FolderInfo
  ) => MaybePromise<T>
}

const getFileInfo = async (
  filePath: string,
  workspacePath: string,
  isGetFileContent = true
): Promise<FileInfo | null> => {
  let fileContent = ''

  if (isGetFileContent) {
    fileContent = await VsCodeFS.readFileOrOpenDocumentContent(
      filePath,
      'utf-8'
    )
  }
  const relativePath = path.relative(workspacePath, filePath)

  return {
    type: 'file',
    content: fileContent,
    relativePath,
    fullPath: filePath
  }
}

const getFolderInfo = async (
  folderPath: string,
  workspacePath: string
): Promise<FolderInfo> => {
  const relativePath = path.relative(workspacePath, folderPath)

  return {
    type: 'folder',
    relativePath,
    fullPath: folderPath
  }
}

export const traverseFileOrFolders = async <T, Type extends FsType>(
  props: TraverseOptions<T, Type>
): Promise<T[]> => {
  const {
    type = 'file',
    filesOrFolders,
    isGetFileContent = true,
    workspacePath,
    itemCallback
  } = props
  const itemPathSet = new Set<string>()
  const results: T[] = []

  const processFolder = async (folderPath: string) => {
    if (itemPathSet.has(folderPath)) return

    itemPathSet.add(folderPath)
    const folderInfo = await getFolderInfo(folderPath, workspacePath)
    results.push(await itemCallback(folderInfo as any))
  }

  const processFile = async (filePath: string) => {
    if (itemPathSet.has(filePath)) return

    itemPathSet.add(filePath)
    const fileInfo = await getFileInfo(
      filePath,
      workspacePath,
      isGetFileContent
    )
    results.push(await itemCallback(fileInfo as any))
  }

  await Promise.allSettled(
    filesOrFolders.map(async fileOrFolder => {
      const absolutePath = path.isAbsolute(fileOrFolder)
        ? fileOrFolder
        : path.join(workspacePath, fileOrFolder)
      const stat = await VsCodeFS.stat(absolutePath)

      if (stat.type === vscode.FileType.Directory) {
        if (type === 'folder') {
          const allFolders = await getAllValidFolders(absolutePath)
          await Promise.allSettled(
            allFolders.map(async folderPath => {
              await processFolder(folderPath)
            })
          )
        } else if (type === 'file') {
          const allFiles = await getAllValidFiles(absolutePath)
          await Promise.allSettled(
            allFiles.map(async filePath => {
              await processFile(filePath)
            })
          )
        }
      }

      if (stat.type === vscode.FileType.File && type === 'file') {
        await processFile(absolutePath)
      }
    })
  )

  return results
}
