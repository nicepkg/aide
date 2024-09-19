import path from 'path'
import { t } from '@extension/i18n'
import { getLanguageIdExt } from '@shared/utils/vscode-lang'
import * as vscode from 'vscode'

interface TmpFileUriOptions {
  originalFileUri?: vscode.Uri
  originalFileFullPath?: string
  languageId: string
  ext?: string
  untitled?: boolean
}

export const getTmpFileUri = ({
  originalFileUri,
  originalFileFullPath,
  languageId,
  ext,
  untitled = true
}: TmpFileUriOptions): vscode.Uri => {
  if (!originalFileUri && !originalFileFullPath) {
    throw new Error(t('error.fileNotFound'))
  }

  const filePath = originalFileFullPath || originalFileUri!.fsPath
  const {
    dir: originalFileDir,
    name: originalFileName,
    ext: originalFileExt
  } = path.parse(filePath)
  const languageExt = ext || getLanguageIdExt(languageId) || languageId

  const finalPath = path.join(
    originalFileDir,
    `${originalFileName}${originalFileExt}.aide${languageExt ? `.${languageExt}` : ''}`
  )

  return untitled
    ? vscode.Uri.parse(`untitled:${finalPath}`)
    : vscode.Uri.file(finalPath)
}
