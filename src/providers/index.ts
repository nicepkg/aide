import * as vscode from 'vscode'

import { TmpFileActionCodeLensProvider } from './tmp-file-action'

export const registerProviders = async (context: vscode.ExtensionContext) => {
  const tmpFileActionCodeLensProvider = new TmpFileActionCodeLensProvider()

  // register CodeLensProvider, only for untitled scheme and file name contains .aide
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: 'untitled', pattern: '**/*.aide*' },
      tmpFileActionCodeLensProvider
    )
  )
}
