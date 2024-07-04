import * as vscode from 'vscode'

import { languageIdExtMap } from './constants'
import { logger } from './logger'

export const getOrCreateTerminal = async (
  name: string,
  cwd: string
): Promise<vscode.Terminal> => {
  let terminal = vscode.window.terminals.find(t => t.name === name)
  if (!terminal || terminal.exitStatus) {
    terminal = vscode.window.createTerminal({ name, cwd })
  }
  return terminal
}

export const executeCommand = async (
  command: string,
  cwd: string
): Promise<void> => {
  const terminal = await getOrCreateTerminal('aide', cwd)
  terminal.show(true)
  terminal.sendText(command)
}

export const getErrorMsg = (err: any): string => {
  if (err instanceof Error) {
    return err.message
  }

  if (typeof err === 'string') {
    return err
  }

  return 'An error occurred'
}

export const commandErrorCatcher = <T extends (...args: any[]) => any>(
  commandFn: T
): T =>
  (async (...args: any[]) => {
    try {
      return await commandFn(...args)
    } catch (err) {
      logger.warn('commandErrorCatcher', err)
      vscode.window.showErrorMessage(getErrorMsg(err))
    }
  }) as T

export const getLanguageIdExt = (languageId: string): string =>
  languageIdExtMap[languageId as keyof typeof languageIdExtMap]?.[0] || ''

export const getCurrentWorkspaceFolder = () => {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) return

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    activeEditor.document.uri
  )

  return workspaceFolder
}
