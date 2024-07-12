import { commandErrorCatcher } from '@/utils'
import * as vscode from 'vscode'

import { handleAskAI } from './ask-ai'
import { handleCodeConvert } from './code-convert'
import { handleCodeViewerHelper } from './code-viewer-helper'
import { handleCopyAsPrompt } from './copy-as-prompt'
import { handleRenameVariable } from './rename-variable'

export const registerCommands = (context: vscode.ExtensionContext) => {
  const copyDisposable = vscode.commands.registerCommand(
    'aide.copyAsPrompt',
    commandErrorCatcher(handleCopyAsPrompt)
  )
  const askAIDisposable = vscode.commands.registerCommand(
    'aide.askAI',
    commandErrorCatcher(handleAskAI)
  )

  const codeConvertDisposable = vscode.commands.registerCommand(
    'aide.codeConvert',
    commandErrorCatcher(handleCodeConvert)
  )

  const codeViewerHelperDisposable = vscode.commands.registerCommand(
    'aide.codeViewerHelper',
    commandErrorCatcher(handleCodeViewerHelper)
  )

  const renameVariableDisposable = vscode.commands.registerCommand(
    'aide.renameVariable',
    commandErrorCatcher(handleRenameVariable)
  )

  context.subscriptions.push(
    copyDisposable,
    askAIDisposable,
    codeConvertDisposable,
    codeViewerHelperDisposable,
    renameVariableDisposable
  )
}
