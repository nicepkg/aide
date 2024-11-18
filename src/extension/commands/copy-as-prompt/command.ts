import { getConfigKey } from '@extension/config'
import { getFileOrFoldersPromptInfo } from '@extension/file-utils/get-fs-prompt-info'
import { t } from '@extension/i18n'
import * as vscode from 'vscode'

import { BaseCommand } from '../base.command'

export class CopyAsPromptCommand extends BaseCommand {
  get commandName(): string {
    return 'aide.copyAsPrompt'
  }

  async run(uri: vscode.Uri, selectedUris: vscode.Uri[] = []): Promise<void> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)
    if (!workspaceFolder) throw new Error(t('error.noWorkspace'))

    const selectedItems = selectedUris?.length > 0 ? selectedUris : [uri]
    if (selectedItems.length === 0) throw new Error(t('error.noSelection'))

    const selectedFileOrFolders = selectedItems.map(item => item.fsPath)
    const { promptFullContent } = await getFileOrFoldersPromptInfo(
      selectedFileOrFolders,
      workspaceFolder.uri.fsPath
    )
    const aiPrompt = await getConfigKey('aiPrompt')
    const finalPrompt = aiPrompt.replace('#{content}', promptFullContent)

    await vscode.env.clipboard.writeText(finalPrompt)
    vscode.window.showInformationMessage(t('info.copied'))
  }
}