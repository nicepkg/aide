import path from 'path'
import { getConfigKey } from '@/config'
import { t } from '@/i18n'
import { logger } from '@/logger'
import { glob } from 'glob'
import ignore from 'ignore'
import { Minimatch } from 'minimatch'
import * as vscode from 'vscode'

import { VsCodeFS } from './vscode-fs'

export const createShouldIgnore = async (fullDirPath: string) => {
  const dirUri = vscode.Uri.file(fullDirPath)
  const workspacePath = vscode.workspace.getWorkspaceFolder(dirUri)?.uri.fsPath

  if (!workspacePath) throw new Error(t('error.noWorkspace'))

  const ignorePatterns = await getConfigKey('ignorePatterns')
  const respectGitIgnore = await getConfigKey('respectGitIgnore')

  let ig: ReturnType<typeof ignore> | null = null

  if (respectGitIgnore) {
    try {
      const gitignorePath = path.join(workspacePath, '.gitignore')
      const gitIgnoreContent = await VsCodeFS.readFile(gitignorePath, 'utf-8')
      ig = ignore().add(gitIgnoreContent)
    } catch (error) {
      // .gitignore file doesn't exist or couldn't be read
      logger.warn("Couldn't read .gitignore file:", error)
    }
  }

  const mms = ignorePatterns.map(
    pattern =>
      new Minimatch(pattern, {
        dot: true,
        matchBase: true
      })
  )

  const shouldIgnore = (fullFilePath: string) => {
    const relativePath = path.relative(workspacePath, fullFilePath)
    const unixRelativePath = relativePath.replace(/\\/g, '/')

    if (ig && ig.ignores(unixRelativePath)) {
      return true
    }

    return mms.some(mm => mm.match(unixRelativePath))
  }

  return shouldIgnore
}

export const getAllValidFiles = async (
  fullDirPath: string
): Promise<string[]> => {
  const shouldIgnore = await createShouldIgnore(fullDirPath)

  return glob('**/*', {
    cwd: fullDirPath,
    nodir: true,
    absolute: true,
    follow: false,
    dot: true,
    ignore: {
      ignored(p) {
        return shouldIgnore(p.fullpath())
      },
      childrenIgnored(p) {
        try {
          return shouldIgnore(p.fullpath())
        } catch {
          return false
        }
      }
    }
  })
}
