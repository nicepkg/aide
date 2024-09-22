import * as path from 'path'
import type { MaybePromise } from '@extension/types/common'
import * as vscode from 'vscode'

import {
  createShouldIgnore,
  getAllValidFiles,
  getAllValidFolders
} from './ignore-patterns'
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
  ignorePatterns?: string[]
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
    ignorePatterns,
    itemCallback
  } = props
  const itemPathSet = new Set<string>()
  const results: T[] = []

  const shouldIgnore = await createShouldIgnore(workspacePath, ignorePatterns)

  const processFolder = async (folderPath: string) => {
    if (itemPathSet.has(folderPath) || shouldIgnore(folderPath)) return

    itemPathSet.add(folderPath)
    const folderInfo = await getFolderInfo(folderPath, workspacePath)
    results.push(await itemCallback(folderInfo as any))
  }

  const processFile = async (filePath: string) => {
    if (itemPathSet.has(filePath) || shouldIgnore(filePath)) return

    itemPathSet.add(filePath)
    const fileInfo = await getFileInfo(
      filePath,
      workspacePath,
      isGetFileContent
    )
    results.push(await itemCallback(fileInfo as any))
  }

  const getAllValidItemsWithCustomIgnore = async (dirPath: string) => {
    if (type === 'folder') {
      return getAllValidFolders(dirPath, shouldIgnore)
    }
    return getAllValidFiles(dirPath, shouldIgnore)
  }

  await Promise.allSettled(
    filesOrFolders.map(async fileOrFolder => {
      const absolutePath = path.isAbsolute(fileOrFolder)
        ? fileOrFolder
        : path.join(workspacePath, fileOrFolder)
      const stat = await VsCodeFS.stat(absolutePath)

      if (stat.type === vscode.FileType.Directory) {
        const allItems = await getAllValidItemsWithCustomIgnore(absolutePath)
        await Promise.allSettled(
          allItems.map(async itemPath => {
            if (type === 'folder') {
              await processFolder(itemPath)
            } else {
              await processFile(itemPath)
            }
          })
        )
      }

      if (stat.type === vscode.FileType.File && type === 'file') {
        await processFile(absolutePath)
      }
    })
  )

  return results
}
