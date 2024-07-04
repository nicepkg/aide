import * as vscode from 'vscode'

import { registerCommands } from './commands'
import { enableGlobalProxy } from './enable-global-proxy'
import { initializeLocalization } from './i18n'
import { logger } from './logger'

export const activate = (context: vscode.ExtensionContext) => {
  const { extensionPath } = context

  initializeLocalization(extensionPath)

  logger.log('"aide" is now active!')

  enableGlobalProxy()
  registerCommands(context)
}
