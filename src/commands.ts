/* eslint-disable @typescript-eslint/no-loop-func */
import { quote } from 'shell-quote'
import * as vscode from 'vscode'

import pkg from '../package.json'
import { getConfig } from './config'
import { processWorkspaceItem } from './files-processor'
import { t } from './i18n'
import { commandErrorCatcher, executeCommand } from './utils'

const handleCopyAsPrompt = async (
  uri: vscode.Uri,
  selectedUris: vscode.Uri[] = []
) => {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)

  if (!workspaceFolder) {
    vscode.window.showErrorMessage(t('error.noWorkspace'))
    return
  }

  const selectedItems = selectedUris?.length > 0 ? selectedUris : [uri]

  if (selectedItems.length === 0) {
    vscode.window.showInformationMessage(t('info.noSelection'))
    return
  }

  let promptFullContent = ''
  for (const item of selectedItems) {
    promptFullContent += (
      await processWorkspaceItem(item, workspaceFolder.uri.fsPath)
    ).promptFullContent
  }

  const config = getConfig()

  const finalPrompt = config.aiPromptTemplate.replace(
    '#{content}',
    promptFullContent
  )

  await vscode.env.clipboard.writeText(finalPrompt)
  vscode.window.showInformationMessage(t('info.copied'))
}

const handleAskAI = async (
  uri: vscode.Uri,
  selectedUris: vscode.Uri[] = []
) => {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)
  if (!workspaceFolder) {
    vscode.window.showErrorMessage(t('error.noWorkspace'))
    return
  }

  const selectedItems = selectedUris?.length > 0 ? selectedUris : [uri]
  if (selectedItems.length === 0) {
    vscode.window.showInformationMessage(t('info.noSelection'))
    return
  }

  let filesPrompt = ''
  let filesRelativePath = ''
  let filesFullPath = ''

  for (const item of selectedItems) {
    const { promptFullContent: itemPromptFullContent, files: itemFilesInfo } =
      await processWorkspaceItem(item, workspaceFolder.uri.fsPath)
    filesPrompt += itemPromptFullContent

    itemFilesInfo.forEach(fileInfo => {
      filesRelativePath += ` "${quote([fileInfo.relativePath.trim()])}" `
      filesFullPath += ` "${quote([fileInfo.fullPath.trim()])}" `
    })
  }

  const config = getConfig()
  const { aiCommandTemplate, aiCommandCopyBeforeRun } = config

  if (!aiCommandTemplate) {
    vscode.window
      .showInformationMessage(
        t('error.noAICommand', pkg.homepage),
        {
          modal: false
        },
        t('info.openDoc')
      )
      .then(selection => {
        if (selection === t('info.openDoc')) {
          vscode.env.openExternal(vscode.Uri.parse(pkg.homepage))
        }
      })

    return
  }

  let userInput = ''
  if (aiCommandTemplate.includes('#{question}')) {
    userInput =
      (await vscode.window.showInputBox({
        prompt: t('input.aiCommand.prompt'),
        placeHolder: t('input.aiCommand.placeholder')
      })) || ''
  }

  const finalCommand = aiCommandTemplate
    .replace(/#{filesRelativePath}/g, filesRelativePath)
    .replace(/#{filesFullPath}/g, filesFullPath)
    .replace(/#{content}/g, ` "${quote([filesPrompt.trim()])}" `)
    .replace(/#{question}/g, ` "${quote([userInput.trim()])}" `)

  if (aiCommandCopyBeforeRun) {
    await vscode.env.clipboard.writeText(finalCommand)
  }

  await executeCommand(finalCommand, workspaceFolder.uri.fsPath)
}

export const registerCommands = (context: vscode.ExtensionContext) => {
  const copyDisposable = vscode.commands.registerCommand(
    'extension.copyAsPrompt',
    commandErrorCatcher(handleCopyAsPrompt)
  )
  const askAIDisposable = vscode.commands.registerCommand(
    'extension.askAI',
    commandErrorCatcher(handleAskAI)
  )

  context.subscriptions.push(copyDisposable, askAIDisposable)
}
