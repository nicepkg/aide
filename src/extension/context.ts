import * as vscode from 'vscode'

import { t } from './i18n'

let globalContext: vscode.ExtensionContext | undefined

export const setContext = (context: vscode.ExtensionContext) => {
  globalContext = context
}

export const getContext = (): vscode.ExtensionContext => {
  if (!globalContext) {
    throw new Error(t('error.noContext'))
  }
  return globalContext
}
