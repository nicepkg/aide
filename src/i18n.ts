/* eslint-disable no-console */
import fs from 'fs/promises'
import * as path from 'path'
import * as vscode from 'vscode'

import { LocalizeFunction, Messages } from './types'

let messages: Messages = {}

export const initializeLocalization = async (
  extensionPath: string
): Promise<void> => {
  const { language } = vscode.env
  const languageFilePath = path.join(
    extensionPath,
    `package.nls.${language}.json`
  )
  const defaultFilePath = path.join(extensionPath, 'package.nls.en.json')

  try {
    messages = JSON.parse(await fs.readFile(languageFilePath, 'utf-8'))
  } catch (err) {
    console.warn(
      `Failed to load language file for ${language}, falling back to default`
    )
    messages = JSON.parse(await fs.readFile(defaultFilePath, 'utf-8'))
  }
}

const format = (message: string, args: any[]): string =>
  message.replace(/{(\d+)}/g, (match, number) =>
    typeof args[number] !== 'undefined' ? args[number] : match
  )

export const t: LocalizeFunction = (key: string, ...args: any[]) => {
  const message = messages[key] ?? key
  return args.length > 0 ? format(message, args) : message
}
