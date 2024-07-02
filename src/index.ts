/* eslint-disable no-console */
import * as vscode from 'vscode'

import { registerCommands } from './commands'
import { initializeLocalization } from './i18n'

export const activate = (context: vscode.ExtensionContext) => {
  const { extensionPath } = context

  initializeLocalization(extensionPath)

  console.log('"aide" is now active!')

  registerCommands(context)
}
