import { getConfigKey } from '@/config'
import { AbortError } from '@/constants'
import { isTmpFileUri } from '@/file-utils/create-tmp-file'
import { traverseFileOrFolders } from '@/file-utils/traverse-fs'
import { t } from '@/i18n'
import { createLoading } from '@/loading'
import { logger } from '@/logger'
import { stateStorage } from '@/storage'
import pLimit from 'p-limit'
import * as vscode from 'vscode'

import { getPreProcessInfo } from './get-pre-process-info'
import { writeAndSaveTmpFile } from './write-and-save-tmp-file'

export const handleBatchProcessor = async (
  uri: vscode.Uri,
  selectedUris: vscode.Uri[] = []
) => {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)
  if (!workspaceFolder) throw new Error(t('error.noWorkspace'))

  const selectedItems = selectedUris?.length > 0 ? selectedUris : [uri]
  if (selectedItems.length === 0) throw new Error(t('error.noSelection'))

  const selectedFileOrFolders = selectedItems.map(item => item.fsPath)
  const filesInfo = await traverseFileOrFolders(
    selectedFileOrFolders,
    workspaceFolder.uri.fsPath,
    fileInfo => fileInfo
  )
  const fileRelativePathsForProcess = filesInfo
    .filter(fileInfo => !isTmpFileUri(vscode.Uri.file(fileInfo.fullPath)))
    .map(fileInfo => fileInfo.relativePath)

  // show input box
  const prompt = await vscode.window.showInputBox({
    prompt: t(
      'input.batchProcessor.prompt',
      fileRelativePathsForProcess.length
    ),
    placeHolder: t('input.batchProcessor.placeholder'),
    value: stateStorage.getItem('batchProcessorLastPrompt') || ''
  })

  if (!prompt) return
  stateStorage.setItem('batchProcessorLastPrompt', prompt)

  const abortController = new AbortController()
  const { showProcessLoading, hideProcessLoading } = createLoading()

  try {
    showProcessLoading({
      onCancel() {
        abortController.abort()
      }
    })

    const preProcessInfo = await getPreProcessInfo({
      prompt,
      fileRelativePathsForProcess,
      abortController
    })

    logger.log('handleBatchProcessor', preProcessInfo)

    if (abortController?.signal.aborted) throw AbortError

    const apiConcurrency = (await getConfigKey('apiConcurrency')) || 1
    const limit = pLimit(apiConcurrency)
    const promises = preProcessInfo.processFilePathInfo.map(info =>
      limit(() =>
        writeAndSaveTmpFile({
          prompt,
          workspacePath: workspaceFolder.uri.fsPath,
          allFileRelativePaths: preProcessInfo.allFileRelativePaths,
          sourceFileRelativePath: info.sourceFileRelativePath,
          processedFileRelativePath: info.processedFileRelativePath,
          dependenceFileRelativePath: preProcessInfo.dependenceFileRelativePath,
          abortController
        }).catch(err => logger.warn('writeAndSaveTmpFile error', err))
      )
    )

    await Promise.allSettled(promises)
    hideProcessLoading()
    await vscode.window.showInformationMessage(
      t(
        'info.batchProcessorSuccess',
        preProcessInfo.processFilePathInfo.length,
        prompt
      )
    )
  } finally {
    hideProcessLoading()
  }
}
