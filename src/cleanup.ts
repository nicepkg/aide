import * as vscode from 'vscode'

import { cleanupCodeConvertRunnables } from './commands/code-convert'
import { cleanupCodeViewerHelperRunnables } from './commands/code-viewer-helper'

export const cleanup = async (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(() => {
      cleanupCodeConvertRunnables()
      cleanupCodeViewerHelperRunnables()
    })
  )
}
