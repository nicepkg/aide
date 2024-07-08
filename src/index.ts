import * as vscode from 'vscode'

import { registerCommands } from './commands'
import { enableGlobalProxy } from './enable-global-proxy'
import { initializeLocalization } from './i18n'
import { logger } from './logger'
import { enablePolyfill } from './polyfill'

export const activate = async (context: vscode.ExtensionContext) => {
  try {
    const { extensionPath } = context

    initializeLocalization(extensionPath)

    logger.log('"aide" is now active!')

    await enablePolyfill()
    enableGlobalProxy()

    registerCommands(context)
  } catch (err) {
    logger.warn('Failed to activate extension', err)
  }
}
