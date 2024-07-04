import path from 'path'
import * as vscode from 'vscode'

import { t } from './i18n'
import { getLanguageIdExt } from './utils'

export interface CreateTempFileOptions {
  buildFileName?: (originalFileName: string, languageExt: string) => string
  languageId?: string
}

export interface WriteTempFileResult {
  document: vscode.TextDocument
  writeText: (text: string) => Promise<void>
  writeTextPart: (textPart: string) => Promise<void>
}

export async function createTempFileAndWriter(
  options: CreateTempFileOptions = {}
): Promise<WriteTempFileResult> {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) {
    throw new Error(t('info.noActiveEditor'))
  }

  const originalFilePath = activeEditor.document.fileName
  const originalFileDir = path.dirname(originalFilePath)
  const originalFileName = path.parse(originalFilePath).name

  const languageId = options.languageId || 'plaintext'
  const languageExt = getLanguageIdExt(languageId)

  let newFileName: string
  if (options.buildFileName) {
    newFileName = options.buildFileName(originalFileName, languageExt)
  } else {
    newFileName = `${originalFileName}${languageExt ? `.${languageExt}` : ''}`
  }

  const newFileUri = vscode.Uri.parse(
    `untitled:${path.join(originalFileDir, newFileName)}`
  )

  const newDocument = await vscode.workspace.openTextDocument(newFileUri)

  await vscode.window.showTextDocument(newDocument, {
    preview: false,
    viewColumn: vscode.ViewColumn.Beside
  })

  vscode.languages.setTextDocumentLanguage(newDocument, languageId)

  const writeText = async (text: string) => {
    const edit = new vscode.WorkspaceEdit()
    edit.insert(newFileUri, new vscode.Position(0, 0), text)
    await vscode.workspace.applyEdit(edit)
  }

  const writeTextPart = async (textPart: string) => {
    const edit = new vscode.WorkspaceEdit()
    const position = new vscode.Position(newDocument.lineCount, 0)
    edit.insert(newDocument.uri, position, textPart)
    await vscode.workspace.applyEdit(edit)
  }

  return { document: newDocument, writeText, writeTextPart }
}
