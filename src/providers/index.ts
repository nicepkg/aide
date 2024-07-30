import * as vscode from 'vscode'

import { TmpFileActionCodeLensProvider } from './tmp-file-action'

export const registerProviders = async (context: vscode.ExtensionContext) => {
  const tmpFileActionCodeLensProvider = new TmpFileActionCodeLensProvider()

  // register CodeLensProvider, only for file name contains .aide
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: '*', pattern: '**/*.aide*' },
      tmpFileActionCodeLensProvider
    )
  )
}
