/* eslint-disable @typescript-eslint/no-loop-func */
import { getConfigKey } from '@/config'
import { processWorkspaceItem } from '@/files-processor'
import { t } from '@/i18n'
import { executeCommand } from '@/utils'
import { quote } from 'shell-quote'
import * as vscode from 'vscode'

import pkg from '../../package.json'

export const handleAskAI = async (
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

  const aiCommand = await getConfigKey('aiCommand')
  const aiCommandCopyBeforeRun = await getConfigKey('aiCommandCopyBeforeRun')

  if (!aiCommand) {
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
  if (aiCommand.includes('#{question}')) {
    userInput =
      (await vscode.window.showInputBox({
        prompt: t('input.aiCommand.prompt'),
        placeHolder: t('input.aiCommand.placeholder')
      })) || ''
  }

  const finalCommand = aiCommand
    .replace(/#{filesRelativePath}/g, filesRelativePath)
    .replace(/#{filesFullPath}/g, filesFullPath)
    .replace(/#{content}/g, ` "${quote([filesPrompt.trim()])}" `)
    .replace(/#{question}/g, ` "${quote([userInput.trim()])}" `)

  if (aiCommandCopyBeforeRun) {
    await vscode.env.clipboard.writeText(finalCommand)
  }

  await executeCommand(finalCommand, workspaceFolder.uri.fsPath)
}
