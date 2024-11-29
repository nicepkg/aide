import * as path from 'path'
import type { MaybePromise } from '@shared/types/common'
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

type FsType = 'file' | 'folder' | 'fileOrFolder'

export type FsItemInfo = FileInfo | FolderInfo

export interface TraverseOptions<T, Type extends FsType = 'file'> {
  type: Type
  filesOrFolders: string[]
  isGetFileContent?: boolean // default is true
  workspacePath: string
  ignorePatterns?: string[]
  customShouldIgnore?: (fullFilePath: string) => boolean
  itemCallback: (
    itemInfo: Type extends 'file'
      ? FileInfo
      : Type extends 'folder'
        ? FolderInfo
        : FsItemInfo
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
  const relativePath = path.relative(workspacePath, folderPath) || './'

  return {
    type: 'folder',
    relativePath,
    fullPath: folderPath
  }
}

export const traverseFileOrFolders = async <T, Type extends FsType>(
  options: TraverseOptions<T, Type>
): Promise<T[]> => {
  const {
    type = 'file',
    filesOrFolders,
    isGetFileContent = true,
    workspacePath,
    ignorePatterns,
    customShouldIgnore,
    itemCallback
  } = options
  const itemPathSet = new Set<string>()
  const results: T[] = []

  let shouldIgnore = customShouldIgnore

  if (!shouldIgnore) {
    shouldIgnore = await createShouldIgnore(workspacePath, ignorePatterns)
  }

  const processFolder = async (folderPath: string) => {
    if (itemPathSet.has(folderPath) || shouldIgnore(folderPath)) return

    itemPathSet.add(folderPath)
    const folderInfo = await getFolderInfo(folderPath, workspacePath)
    if (type === 'folder' || type === 'fileOrFolder') {
      results.push(await itemCallback(folderInfo as any))
    }
  }

  const processFile = async (filePath: string) => {
    if (itemPathSet.has(filePath) || shouldIgnore(filePath)) return

    itemPathSet.add(filePath)
    const fileInfo = await getFileInfo(
      filePath,
      workspacePath,
      isGetFileContent
    )
    if (fileInfo && (type === 'file' || type === 'fileOrFolder')) {
      results.push(await itemCallback(fileInfo as any))
    }
  }

  const getAllValidItemsWithCustomIgnore = async (dirPath: string) => {
    if (type === 'folder') {
      return getAllValidFolders(dirPath, shouldIgnore)
    }
    if (type === 'file') {
      return getAllValidFiles(dirPath, shouldIgnore)
    }
    // For 'fileOrFolder' type, get both files and folders
    const files = await getAllValidFiles(dirPath, shouldIgnore)
    const folders = await getAllValidFolders(dirPath, shouldIgnore)
    return [...files, ...folders]
  }

  await Promise.allSettled(
    filesOrFolders.map(async fileOrFolder => {
      const absolutePath = path.isAbsolute(fileOrFolder)
        ? fileOrFolder
        : path.join(workspacePath, fileOrFolder)
      const stat = await VsCodeFS.stat(absolutePath)

      if (stat.type === vscode.FileType.Directory) {
        if (type === 'folder' || type === 'fileOrFolder') {
          await processFolder(absolutePath)
        }
        const allItems = await getAllValidItemsWithCustomIgnore(absolutePath)
        await Promise.allSettled(
          allItems.map(async itemPath => {
            const itemStat = await VsCodeFS.stat(itemPath)
            if (itemStat.type === vscode.FileType.Directory) {
              await processFolder(itemPath)
            } else {
              await processFile(itemPath)
            }
          })
        )
      }

      if (
        stat.type === vscode.FileType.File &&
        (type === 'file' || type === 'fileOrFolder')
      ) {
        await processFile(absolutePath)
      }
    })
  )

  return results
}
