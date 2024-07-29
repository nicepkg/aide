import path from 'path'
import { getConfigKey } from '@/config'
import { t } from '@/i18n'
import { logger } from '@/logger'
import { glob } from 'glob'
import ignore from 'ignore'
import { Minimatch } from 'minimatch'
import * as vscode from 'vscode'

import { VsCodeFS } from './vscode-fs'

/**
 * Creates a function that determines whether a file should be ignored based on the provided ignore patterns.
 * @param fullDirPath - The full directory path of the file.
 * @returns A function that takes a full file path as input and returns a boolean indicating whether the file should be ignored.
 * @throws An error if the workspace path cannot be determined.
 */
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

  /**
   * Determines whether a file should be ignored based on the ignore patterns.
   * @param fullFilePath - The full path of the file.
   * @returns A boolean indicating whether the file should be ignored.
   */
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

/**
 * Retrieves all valid files in the specified directory path.
 * @param fullDirPath - The full path of the directory.
 * @returns A promise that resolves to an array of strings representing the absolute paths of the valid files.
 */
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
