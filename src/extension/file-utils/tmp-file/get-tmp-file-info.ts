import path from 'path'
import { getActiveEditor } from '@extension/utils'
import * as vscode from 'vscode'

import { getTmpFileUri } from './get-tmp-file-uri'

export interface TmpFileInfo {
  originalFileUri: vscode.Uri
  originalFileDocument: vscode.TextDocument
  originalFileContent: string
  originalFileContentIsFromSelection: boolean
  originalFileLanguageId: string
  originalFileExt: string
  activeIsOriginalFile: boolean
  isSelection: boolean
  tmpFileUri: vscode.Uri
  isTmpFileExists: boolean
  isTmpFileHasContent: boolean
}

export const getTmpFileInfo = async (
  originalFileUri: vscode.Uri
): Promise<TmpFileInfo> => {
  const activeEditor = getActiveEditor()
  const activeFileUri = activeEditor.document.uri
  const activeIsOriginalFile = originalFileUri.fsPath === activeFileUri.fsPath

  let originalFileContent = ''
  let isSelection = false
  let originalFileDocument: vscode.TextDocument
  let originalFileContentIsFromSelection = false

  if (activeIsOriginalFile) {
    const { selection } = activeEditor
    isSelection = !selection.isEmpty
    originalFileContent = isSelection
      ? activeEditor.document.getText(selection)
      : activeEditor.document.getText()
    originalFileDocument = activeEditor.document
    originalFileContentIsFromSelection = isSelection
  } else {
    originalFileDocument =
      await vscode.workspace.openTextDocument(originalFileUri)
    originalFileContent = originalFileDocument.getText()
  }

  const originalFileLanguageId = originalFileDocument.languageId
  const originalFileExt = path.extname(originalFileUri.fsPath).slice(1)
  const tmpFileUri = getTmpFileUri({
    originalFileUri,
    languageId: originalFileLanguageId
  })
  const tmpFileDocument = vscode.workspace.textDocuments.find(
    document => document.uri.fsPath === tmpFileUri.fsPath
  )
  const isTmpFileExists = !!tmpFileDocument
  const isTmpFileHasContent = !!tmpFileDocument?.getText()

  return {
    originalFileUri,
    originalFileDocument,
    originalFileContent,
    originalFileContentIsFromSelection,
    originalFileLanguageId,
    originalFileExt,
    activeIsOriginalFile,
    isSelection,
    tmpFileUri,
    isTmpFileExists,
    isTmpFileHasContent
  }
}
