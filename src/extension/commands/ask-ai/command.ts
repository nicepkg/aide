import path from 'path'
import { getConfigKey } from '@extension/config'
import {
  traverseFileOrFolders,
  type FileInfo
} from '@extension/file-utils/traverse-fs'
import { t } from '@extension/i18n'
import { executeCommand } from '@extension/utils'
import { quote } from 'shell-quote'
import * as vscode from 'vscode'

import { BaseCommand } from '../base.command'

export class AskAICommand extends BaseCommand {
  get commandName(): string {
    return 'aide.askAI'
  }

  async run(uri: vscode.Uri, selectedUris: vscode.Uri[] = []): Promise<void> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)
    if (!workspaceFolder) throw new Error(t('error.noWorkspace'))

    const selectedItems = selectedUris?.length > 0 ? selectedUris : [uri]
    if (selectedItems.length === 0) throw new Error(t('error.noSelection'))

    const selectedFileOrFolders = selectedItems.map(item => item.fsPath)
    let filesPrompt = ''
    let filesRelativePath = ''
    let filesFullPath = ''

    const processFile = async (fileInfo: FileInfo) => {
      const { fullPath, relativePath, content } = fileInfo
      const language = path.extname(fullPath).slice(1)
      const promptFullContent = t(
        'file.content',
        relativePath,
        language,
        content.toString()
      )

      filesPrompt += promptFullContent
      filesRelativePath += ` "${quote([relativePath.trim()])}" `
      filesFullPath += ` "${quote([fullPath.trim()])}" `
    }

    await traverseFileOrFolders(
      selectedFileOrFolders,
      workspaceFolder.uri.fsPath,
      processFile
    )

    const aiCommand = await getConfigKey('aiCommand')
    const aiCommandCopyBeforeRun = await getConfigKey('aiCommandCopyBeforeRun')
    const aiCommandAutoRun = await getConfigKey('aiCommandAutoRun')
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

      // Show info message only if the command is not set to auto-run
      if (!aiCommandAutoRun) {
        await vscode.window.showInformationMessage(
          t('info.commandCopiedToClipboard')
        )
      }
    }

    if (aiCommandAutoRun) {
      await executeCommand(finalCommand, workspaceFolder.uri.fsPath)
    }
  }
}
