/* eslint-disable @typescript-eslint/no-loop-func */
import { getConfigKey } from '@/config'
import { processWorkspaceItem } from '@/files-processor'
import { t } from '@/i18n'
import { executeCommand } from '@/utils'
import { quote } from 'shell-quote'
import * as vscode from 'vscode'

export const handleAskAI = async (
  uri: vscode.Uri,
  selectedUris: vscode.Uri[] = []
) => {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)
  if (!workspaceFolder) throw new Error(t('error.noWorkspace'))

  const selectedItems = selectedUris?.length > 0 ? selectedUris : [uri]
  if (selectedItems.length === 0) throw new Error(t('error.noSelection'))

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
    .replace(/#{question}/g, ` "${quote([userInput.trim()])}" `)
    .replace(/#{content}/g, ` "${quote([filesPrompt.trim()])}" `)

  if (aiCommandCopyBeforeRun) {
    await vscode.env.clipboard.writeText(finalCommand)
  }

  await executeCommand(finalCommand, workspaceFolder.uri.fsPath)
}
