import path from 'path'
import { getConfigKey } from '@/config'
import type { FileInfo } from '@/file-utils/traverse-fs'
import { traverseFileOrFolders } from '@/file-utils/traverse-fs'
import { t } from '@/i18n'
import * as vscode from 'vscode'

interface PromptInfo {
  promptFullContent: string
  filesInfo: FileInfo[]
}

const getFileOrFoldersPromptInfo = async (
  fileOrFolders: string[],
  workspacePath: string
): Promise<PromptInfo> => {
  const result: PromptInfo = {
    promptFullContent: '',
    filesInfo: []
  }

  const processFile = async (fileInfo: FileInfo) => {
    const { fullPath, relativePath, content } = fileInfo
    const language = path.extname(fullPath).slice(1)

    const promptFullContent = t(
      'file.content',
      relativePath,
      language,
      content.toString()
    )

    result.filesInfo.push(fileInfo)
    result.promptFullContent += promptFullContent
  }

  await traverseFileOrFolders(fileOrFolders, workspacePath, processFile)

  return result
}

export const handleCopyAsPrompt = async (
  uri: vscode.Uri,
  selectedUris: vscode.Uri[] = []
) => {
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
