import { commandErrorCatcher } from '@/utils'
import * as vscode from 'vscode'

import { handleAskAI } from './ask-ai'
import { handleBatchProcessor } from './batch-processor'
import { handleCodeConvert } from './code-convert'
import { handleCodeViewerHelper } from './code-viewer-helper'
import { handleCopyAsPrompt } from './copy-as-prompt'
import { handleCopyFileText } from './private/copy-file-text'
import { handleQuickCloseFileWithoutSave } from './private/quick-close-file-without-save'
import { handleReplaceFile } from './private/replace-file'
import { handleShowAideKeyUsageInfo } from './private/show-aide-key-usage-info'
import { handleShowDiff } from './private/show-diff'
import { handleRenameVariable } from './rename-variable'
import { handleSmartPaste } from './smart-paste'

export const registerCommands = async (context: vscode.ExtensionContext) => {
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

  const smartPasteDisposable = vscode.commands.registerCommand(
    'aide.smartPaste',
    commandErrorCatcher(handleSmartPaste)
  )

  const batchProcessorDisposable = vscode.commands.registerCommand(
    'aide.batchProcessor',
    commandErrorCatcher(handleBatchProcessor)
  )

  // private command
  const copyFileTextDisposable = vscode.commands.registerCommand(
    'aide.copyFileText',
    commandErrorCatcher(handleCopyFileText)
  )

  // private command
  const quickCloseFileWithoutSaveDisposable = vscode.commands.registerCommand(
    'aide.quickCloseFileWithoutSave',
    commandErrorCatcher(handleQuickCloseFileWithoutSave)
  )

  // private command
  const replaceFileDisposable = vscode.commands.registerCommand(
    'aide.replaceFile',
    commandErrorCatcher(handleReplaceFile)
  )

  // private command
  const showDiffDisposable = vscode.commands.registerCommand(
    'aide.showDiff',
    commandErrorCatcher(handleShowDiff)
  )

  // private command
  const showAideKeyUsageInfoDisposable = vscode.commands.registerCommand(
    'aide.showAideKeyUsageInfo',
    commandErrorCatcher(handleShowAideKeyUsageInfo)
  )

  context.subscriptions.push(
    copyDisposable,
    askAIDisposable,
    codeConvertDisposable,
    codeViewerHelperDisposable,
    renameVariableDisposable,
    smartPasteDisposable,
    batchProcessorDisposable,
    copyFileTextDisposable,
    quickCloseFileWithoutSaveDisposable,
    replaceFileDisposable,
    showDiffDisposable,
    showAideKeyUsageInfoDisposable
  )
}
