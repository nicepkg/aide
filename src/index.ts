import * as vscode from 'vscode'

import { BaseModelProvider } from './ai/model-providers/base'
import { cleanup } from './cleanup'
import { registerCommands } from './commands'
import { setContext } from './context'
import { enableGlobalProxy, enableLogFetch } from './enable-global-proxy'
import { initializeLocalization } from './i18n'
import { logger } from './logger'
import { enablePolyfill } from './polyfill'
import { redisStorage, stateStorage } from './storage'

export const activate = async (context: vscode.ExtensionContext) => {
  try {
    const isDev = context.extensionMode !== vscode.ExtensionMode.Production

    logger.log('"aide" is now active!')

    initializeLocalization()
    setContext(context)
    await enablePolyfill()
    enableGlobalProxy()
    isDev && enableLogFetch()

    registerCommands(context)
    await cleanup(context)
  } catch (err) {
    logger.warn('Failed to activate extension', err)
  }
}

export const deactivate = () => {
  // Clear the session history map
  BaseModelProvider.sessionIdHistoriesMap = {}

  // Clear the state storage
  stateStorage.clear()

  // Clear the redis storage
  redisStorage.clear()
}
