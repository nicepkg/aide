import path from 'path'
import { getLanguageId } from '@shared/utils/vscode-lang'
import * as vscode from 'vscode'

import { getOriginalFileUri } from './get-original-file-uri'
import { getTmpFileUri } from './get-tmp-file-uri'

export interface CreateTmpFileOptions {
  ext?: string
  languageId?: string
  tmpFileUri?: vscode.Uri
}

export interface WriteTmpFileResult {
  originalFileUri: vscode.Uri
  tmpFileUri: vscode.Uri
  tmpDocument: vscode.TextDocument
  writeText: (text: string) => Promise<void>
  writeTextPart: (textPart: string) => Promise<void>
  getText: () => string
  save: () => Promise<void>
  close: () => Promise<void>
  isClosedWithoutSaving: () => boolean
}

export const createTmpFileAndWriter = async (
  options: CreateTmpFileOptions
): Promise<WriteTmpFileResult> => {
  if (!options.languageId && !options.tmpFileUri) {
    throw new Error(
      "createTmpFileAndWriter: Either 'languageId' or 'tmpFileUri' must be provided."
    )
  }

  const originalFileUri = getOriginalFileUri()
  const languageId =
    options.languageId ||
    getLanguageId(path.extname(options.tmpFileUri!.fsPath).slice(1))
  const tmpFileUri =
    options.tmpFileUri ||
    getTmpFileUri({
      originalFileUri,
      languageId: languageId!,
      ext: options.ext
    })

  const tmpDocument = await vscode.workspace.openTextDocument(tmpFileUri)
  await showDocumentIfNotVisible(tmpDocument)

  if (languageId) {
    vscode.languages.setTextDocumentLanguage(tmpDocument, languageId)
  }

  return {
    originalFileUri,
    tmpFileUri,
    tmpDocument,
    writeText: (text: string) => writeTextToDocument(tmpDocument, text),
    writeTextPart: (textPart: string) =>
      appendTextToDocument(tmpDocument, textPart),
    getText: () => tmpDocument.getText(),
    save: async () => {
      await tmpDocument.save()
    },
    close: () => closeDocument(tmpFileUri),
    isClosedWithoutSaving: () => tmpDocument.isClosed && !tmpDocument.getText()
  }
}

export const showDocumentIfNotVisible = async (
  document: vscode.TextDocument
): Promise<void> => {
  const isDocumentAlreadyShown = vscode.window.visibleTextEditors.some(
    editor => editor.document.uri.toString() === document.uri.toString()
  )

  if (!isDocumentAlreadyShown) {
    await vscode.window.showTextDocument(document, {
      preview: false,
      viewColumn: vscode.ViewColumn.Beside
    })
  }
}

export const writeTextToDocument = async (
  document: vscode.TextDocument,
  text: string
): Promise<void> => {
  const edit = new vscode.WorkspaceEdit()
  const fullRange = new vscode.Range(
    new vscode.Position(0, 0),
    document.lineAt(document.lineCount - 1).range.end
  )
  edit.delete(document.uri, fullRange)
  edit.insert(document.uri, new vscode.Position(0, 0), text)
  await vscode.workspace.applyEdit(edit)
}

const appendTextToDocument = async (
  document: vscode.TextDocument,
  textPart: string
): Promise<void> => {
  const edit = new vscode.WorkspaceEdit()
  const position = new vscode.Position(document.lineCount, 0)
  edit.insert(document.uri, position, textPart)
  await vscode.workspace.applyEdit(edit)
}

const closeDocument = async (uri: vscode.Uri): Promise<void> => {
  await vscode.commands.executeCommand('aide.quickCloseFileWithoutSave', uri)
}
