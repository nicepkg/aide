import * as vscode from 'vscode'

import { cleanup } from './cleanup'
import { registerCommands } from './commands'
import { setContext } from './context'
import { enableGlobalProxy, enableLogFetch } from './enable-global-proxy'
import { initializeLocalization } from './i18n'
import { logger } from './logger'
import { enablePolyfill } from './polyfill'
import { WorkspaceStorage } from './workspace-storage'

export const activate = async (context: vscode.ExtensionContext) => {
  try {
    const { extensionPath } = context
    const isDev = context.extensionMode !== vscode.ExtensionMode.Production

    initializeLocalization(extensionPath)
    setContext(context)
    WorkspaceStorage.initialize(context)

    logger.log('"aide" is now active!')

    await enablePolyfill()
    enableGlobalProxy()
    isDev && enableLogFetch()

    registerCommands(context)
    await cleanup(context)
  } catch (err) {
    logger.warn('Failed to activate extension', err)
  }
}
