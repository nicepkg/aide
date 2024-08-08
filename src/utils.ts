import * as vscode from 'vscode'

import {
  languageExtIdMap,
  languageIdExtMap,
  languageIdExts,
  languageIds
} from './constants'
import { t } from './i18n'
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
      const errMsg = getErrorMsg(err)
      // skip abort error
      if (['AbortError', 'Aborted'].includes(errMsg)) return

      logger.warn('commandErrorCatcher', err)
      vscode.window.showErrorMessage(getErrorMsg(err))
    }
  }) as T

export const getLanguageIdExt = (languageIdORExt: string): string => {
  if (languageIdExts.includes(languageIdORExt)) return languageIdORExt

  return (
    languageIdExtMap[languageIdORExt as keyof typeof languageIdExtMap]?.[0] ||
    ''
  )
}

export const getLanguageId = (languageIdORExt: string): string => {
  if (languageIds.includes(languageIdORExt)) return languageIdORExt
  if (languageIdExts.includes(languageIdORExt)) {
    return (
      languageExtIdMap[languageIdORExt as keyof typeof languageExtIdMap] ||
      languageIdORExt
    )
  }

  return languageIdORExt
}

export const getCurrentWorkspaceFolderEditor = <T extends boolean = true>(
  throwErrorWhenNotFound: T = true as T
): T extends true
  ? { workspaceFolder: vscode.WorkspaceFolder; activeEditor: vscode.TextEditor }
  : {
      workspaceFolder: vscode.WorkspaceFolder | undefined
      activeEditor: vscode.TextEditor | undefined
    } => {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) {
    if (throwErrorWhenNotFound) throw new Error(t('error.noActiveEditor'))
    return { workspaceFolder: undefined, activeEditor: undefined } as any
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    activeEditor.document.uri
  )

  if (!workspaceFolder) {
    if (throwErrorWhenNotFound) throw new Error(t('error.noWorkspace'))
    return { workspaceFolder: undefined, activeEditor } as any
  }

  return { workspaceFolder, activeEditor }
}

// export const getActiveEditorContent = async () => {
//   const activeEditor = vscode.window.activeTextEditor

//   if (!activeEditor) throw new Error(t('error.noActiveEditor'))

//   const { selection } = activeEditor
//   const isSelection = !selection.isEmpty
//   const content = isSelection
//     ? activeEditor.document.getText(selection)
//     : activeEditor.document.getText()

//   return {
//     activeEditor,
//     content,
//     isSelection
//   }
// }

export const formatNumber = (num: number, fixed: number): string => {
  const numString = num.toFixed(fixed)
  return numString.replace(/\.?0+$/, '')
}

export const removeCodeBlockSyntax = (str: string): string => {
  if (!str) return ''
  return str
    .trim()
    .replace(/^```[\s\S]*?\n([\s\S]*?)\n```$/g, '$1')
    .trim()
}

export const removeCodeBlockStartSyntax = (str: string): string => {
  if (!str) return ''
  return str.replace(/^\s*```[\s\S]*?\n/, '')
}

export const removeCodeBlockEndSyntax = (str: string): string => {
  if (!str) return ''
  return str.replace(/\n```\s*$/g, '')
}

export const tryParseJSON = (str: string, returnOriginal = false) => {
  try {
    return JSON.parse(str)
  } catch (err) {
    return returnOriginal ? str : null
  }
}

export const toPlatformPath = (path: string): string => {
  if (process.platform === 'win32') return path.replace(/\//g, '\\')

  return path.replace(/\\/g, '/')
}

export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

export const normalizeLineEndings = (text?: string): string => {
  if (!text) return ''

  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) return text

  const { eol } = activeEditor.document

  if (eol === vscode.EndOfLine.LF) return text.replace(/\r\n/g, '\n')
  if (eol === vscode.EndOfLine.CRLF) return text.replace(/\n/g, '\r\n')

  return text
}

type QuickPickItemType = string | vscode.QuickPickItem

export interface QuickPickOptions {
  items: QuickPickItemType[]
  placeholder: string
  customOption?: string
}

export const showQuickPickWithCustomInput = async (
  options: QuickPickOptions
): Promise<string> => {
  const quickPick = vscode.window.createQuickPick()

  quickPick.items = options.items.map(item =>
    typeof item === 'string' ? { label: item } : item
  )

  quickPick.placeholder = options.placeholder

  if (options.customOption) {
    quickPick.items = [{ label: options.customOption }, ...quickPick.items]
  }

  return new Promise<string>(resolve => {
    quickPick.onDidAccept(() => {
      const selection = quickPick.selectedItems[0]
      if (selection) {
        resolve(selection.label)
      } else {
        resolve(quickPick.value)
      }
      quickPick.hide()
    })

    quickPick.onDidHide(() => {
      resolve('')
      quickPick.dispose()
    })

    quickPick.show()
  })
}
