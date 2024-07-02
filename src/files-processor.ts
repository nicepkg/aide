import fs from 'fs/promises'
import * as path from 'path'
import { glob } from 'glob'
import { minimatch } from 'minimatch'
import * as vscode from 'vscode'

import { getConfig, type Config } from './config'
import { t } from './i18n'

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
  workspacePath: string,
  config: Config
): Promise<ProcessWorkspaceResult> => {
  const relativePath = path.relative(workspacePath, file.fsPath)

  if (await shouldIgnore(file.fsPath, config.ignorePatterns, workspacePath)) {
    return { promptFullContent: '', files: [] }
  }

  const fileContent = await fs.readFile(file.fsPath, 'utf-8')
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
    content: await fs.readFile(file.fsPath, 'utf-8')
  }

  return { promptFullContent, files: [fileInfo] }
}

const processWorkspaceDirectory = async (
  dir: vscode.Uri,
  workspacePath: string,
  config: Config
): Promise<ProcessWorkspaceResult> => {
  const allFiles = await getAllFiles(dir.fsPath, config.ignorePatterns)
  const results = await Promise.all(
    allFiles.map(file =>
      processWorkspaceFile(vscode.Uri.file(file), workspacePath, config)
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
  const stat = await fs.stat(item.fsPath)
  const config = getConfig()

  if (stat.isDirectory()) {
    return processWorkspaceDirectory(item, workspacePath, config)
  }
  return processWorkspaceFile(item, workspacePath, config)
}
