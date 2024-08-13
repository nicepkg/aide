import * as vscode from 'vscode'

import { cleanupCodeConvertRunnables } from './commands/code-convert'
import { cleanupCodeViewerHelperRunnables } from './commands/code-viewer-helper'
import { cleanupExpertCodeEnhancerRunnables } from './commands/expert-code-enhancer'
import { cleanupSmartPasteRunnables } from './commands/smart-paste'

export const cleanup = async (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(() => {
      cleanupCodeConvertRunnables()
      cleanupCodeViewerHelperRunnables()
      cleanupExpertCodeEnhancerRunnables()
      cleanupSmartPasteRunnables()
    })
  )
}
