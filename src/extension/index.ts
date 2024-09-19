import * as vscode from 'vscode'

import { BaseModelProvider } from './ai/model-providers/base'
import { registerCommands } from './commands'
import { CommandManager } from './commands/command-manager'
import { setContext } from './context'
import { initializeLocalization } from './i18n'
import { logger } from './logger'
import { setupRegisters } from './registers'
import { RegisterManager } from './registers/register-manager'
import { redisStorage, stateStorage } from './storage'
import { searxngSearch } from './webview-api/chat-context-processor/strategies/chat-strategy/utils/searxng-search'

export const activate = async (context: vscode.ExtensionContext) => {
  try {
    logger.log('"Aide" is now active!')

    await initializeLocalization()
    setContext(context)

    const commandManager = new CommandManager(context)
    await registerCommands(commandManager)

    const registerManager = new RegisterManager(context, commandManager)
    await setupRegisters(registerManager)

    const res = await searxngSearch('react  19 new features')
    console.log('searxngSearch', res)
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
