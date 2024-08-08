import * as vscode from 'vscode'

import { BaseModelProvider } from './ai/model-providers/base'
import { autoOpenCorrespondingFiles } from './auto-open-corresponding-files'
import { cleanup } from './cleanup'
import { registerCommands } from './commands'
import { setContext } from './context'
import { enableLogFetch, enableSystemProxy } from './enable-system-proxy'
import { initializeLocalization } from './i18n'
import { logger } from './logger'
import { enablePolyfill } from './polyfill'
import { registerProviders } from './providers'
import { initAideKeyUsageStatusBar } from './providers/aide-key-usage-statusbar'
import { redisStorage, stateStorage } from './storage'

export const activate = async (context: vscode.ExtensionContext) => {
  try {
    const isDev = context.extensionMode !== vscode.ExtensionMode.Production

    logger.log('"aide" is now active!')

    await initializeLocalization()
    setContext(context)
    await enablePolyfill()
    await enableSystemProxy()
    isDev && enableLogFetch()

    await registerCommands(context)
    await registerProviders(context)
    await initAideKeyUsageStatusBar(context)
    await autoOpenCorrespondingFiles(context)
    await cleanup(context)
  } catch (err) {
    logger.warn('Failed to activate extension', err)
  }
}

export const deactivate = () => {
  // clear the session history map
  BaseModelProvider.sessionIdHistoriesMap = {}

  // clear the state storage
  stateStorage.clear()

  // clear the redis storage
  redisStorage.clear()

  // destroy the logger
  logger.destroy()
}
