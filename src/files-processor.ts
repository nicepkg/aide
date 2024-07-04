import * as path from 'path'
import { glob } from 'glob'
import { minimatch } from 'minimatch'
import * as vscode from 'vscode'

import { getConfigKey } from './config'
import { t } from './i18n'
import { VsCodeFS } from './vscode-fs'

const getAllFiles = async (
  dirPath: string,
  ignoreRules: string[]
): Promise<string[]> =>
  glob('**/*', {
    cwd: dirPath,
    nodir: true,
    ignore: ignoreRules,
    absolute: true
  })

const shouldIgnore = async (
  filePath: string,
  ignoreRules: string[],
  workspacePath: string
): Promise<boolean> => {
  const relativePath = path
    .relative(workspacePath, filePath)
    .replace(/\\/g, '/')

  for (const rule of ignoreRules) {
    if (minimatch(relativePath, rule, { dot: true, matchBase: true })) {
      return true
    }
  }
  return false
}

interface WorkspaceFileInfo {
  content: string
  relativePath: string
  fullPath: string
}

interface ProcessWorkspaceResult {
  promptFullContent: string
  files: WorkspaceFileInfo[]
}

const processWorkspaceFile = async (
  file: vscode.Uri,
  workspacePath: string
): Promise<ProcessWorkspaceResult> => {
  const relativePath = path.relative(workspacePath, file.fsPath)
  const ignorePatterns = await getConfigKey('ignorePatterns')

  if (await shouldIgnore(file.fsPath, ignorePatterns, workspacePath)) {
    return { promptFullContent: '', files: [] }
  }

  const fileContent = await VsCodeFS.readFile(file.fsPath, 'utf-8')
  const language = path.extname(file.fsPath).slice(1)

  const promptFullContent = t(
    'file.content',
    relativePath,
    language,
    fileContent.toString()
  )

  const fileInfo: WorkspaceFileInfo = {
    relativePath,
    fullPath: file.fsPath,
    content: await VsCodeFS.readFile(file.fsPath, 'utf-8')
  }

  return { promptFullContent, files: [fileInfo] }
}

const processWorkspaceDirectory = async (
  dir: vscode.Uri,
  workspacePath: string
): Promise<ProcessWorkspaceResult> => {
  const ignorePatterns = await getConfigKey('ignorePatterns')
  const allFiles = await getAllFiles(dir.fsPath, ignorePatterns)
  const results = await Promise.all(
    allFiles.map(file =>
      processWorkspaceFile(vscode.Uri.file(file), workspacePath)
    )
  )

  return results.reduce(
    (acc: ProcessWorkspaceResult, result: ProcessWorkspaceResult) => ({
      promptFullContent: acc.promptFullContent + result.promptFullContent,
      files: [...acc.files, ...result.files]
    }),
    { promptFullContent: '', files: [] as WorkspaceFileInfo[] }
  )
}

export const processWorkspaceItem = async (
  item: vscode.Uri,
  workspacePath: string
): Promise<ProcessWorkspaceResult> => {
  const stat = await VsCodeFS.stat(item.fsPath)

  if (stat.type === vscode.FileType.Directory) {
    return processWorkspaceDirectory(item, workspacePath)
  }
  return processWorkspaceFile(item, workspacePath)
}
