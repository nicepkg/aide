import path from 'path'
import { languageIds } from '@/constants'
import { t } from '@/i18n'
import { getLanguageIdExt } from '@/utils'
import * as vscode from 'vscode'

export const getTmpFileUri = (
  originalFileUri: vscode.Uri,
  languageId: string
) => {
  const originalFileDir = path.dirname(originalFileUri.fsPath)
  const originalFileName = path.parse(originalFileUri.fsPath).name
  const originalFileExt = path.parse(originalFileUri.fsPath).ext

  const languageExt = getLanguageIdExt(languageId) || languageId

  return vscode.Uri.parse(
    `untitled:${path.join(originalFileDir, `${originalFileName}${originalFileExt}.aide${languageExt ? `.${languageExt}` : ''}`)}`
  )
}

export const getOriginalFileUri = () => {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) {
    throw new Error(t('error.noActiveEditor'))
  }

  const aideRegExp = /\.aide(\.[^.]+)?$/
  const activeIsAideGenerated =
    activeEditor.document.uri.scheme === 'untitled' &&
    aideRegExp.test(activeEditor.document.uri.fsPath)

  let originalFileUri = activeEditor.document.uri

  if (activeIsAideGenerated) {
    originalFileUri = vscode.Uri.file(
      activeEditor.document.uri.fsPath.replace(aideRegExp, '')
    )
  }

  return originalFileUri
}

export interface TmpFileInfo {
  originalFileUri: vscode.Uri
  originalFileDocument: vscode.TextDocument
  originalFileContent: string
  originalFileLanguageId: string
  activeIsOriginalFile: boolean
  isSelection: boolean
  tmpFileUri: vscode.Uri
  isTmpFileExists?: boolean
  isTmpFileHasContent?: boolean
}
export const createTmpFileInfo = async (): Promise<TmpFileInfo> => {
  const activeEditor = vscode.window.activeTextEditor

  if (!activeEditor) throw new Error(t('error.noActiveEditor'))

  const originalFileUri = getOriginalFileUri()
  const activeFileUri = activeEditor.document.uri
  const activeIsOriginalFile = originalFileUri.fsPath === activeFileUri.fsPath
  let originalFileContent = ''
  let isSelection = false
  let originalFileDocument: vscode.TextDocument

  if (activeIsOriginalFile) {
    const { selection } = activeEditor
    isSelection = !selection.isEmpty
    originalFileContent = isSelection
      ? activeEditor.document.getText(selection)
      : activeEditor.document.getText()
    originalFileDocument = activeEditor.document
  } else {
    originalFileDocument =
      await vscode.workspace.openTextDocument(originalFileUri)
    originalFileContent = originalFileDocument.getText()
  }

  const originalFileLanguageId = originalFileDocument.languageId
  const tmpFileUri = getTmpFileUri(originalFileUri, originalFileLanguageId)
  const tmpFileDocument = vscode.workspace.textDocuments.find(
    document => document.uri.fsPath === tmpFileUri.fsPath
  )
  const isTmpFileExists = !!tmpFileDocument
  const isTmpFileHasContent = !!tmpFileDocument?.getText()

  return {
    originalFileUri,
    originalFileDocument,
    originalFileContent,
    originalFileLanguageId,
    activeIsOriginalFile,
    isSelection,
    tmpFileUri,
    isTmpFileExists,
    isTmpFileHasContent
  }
}

export interface CreateTmpFileOptions {
  languageId: string
}

export interface WriteTmpFileResult {
  tmpDocument: vscode.TextDocument
  writeText: (text: string) => Promise<void>
  writeTextPart: (textPart: string) => Promise<void>
  getText: () => string
  isClosedWithoutSaving: () => boolean
}

export const createTmpFileAndWriter = async (
  options: CreateTmpFileOptions
): Promise<WriteTmpFileResult> => {
  const { languageId } = options
  const originalFileUri = getOriginalFileUri()
  const tmpFileUri = getTmpFileUri(originalFileUri, languageId)
  const tmpDocument = await vscode.workspace.openTextDocument(tmpFileUri)
  const isDocumentAlreadyShown = vscode.window.visibleTextEditors.some(
    editor => editor.document.uri.toString() === tmpDocument.uri.toString()
  )

  if (!isDocumentAlreadyShown) {
    await vscode.window.showTextDocument(tmpDocument, {
      preview: false,
      viewColumn: vscode.ViewColumn.Beside
    })
  }

  const docLanguageId = languageIds.includes(languageId)
    ? languageId
    : 'plaintext'

  vscode.languages.setTextDocumentLanguage(tmpDocument, docLanguageId)

  const writeText = async (text: string) => {
    const edit = new vscode.WorkspaceEdit()

    // clean the file
    const fullRange = new vscode.Range(
      new vscode.Position(0, 0),
      tmpDocument.lineAt(tmpDocument.lineCount - 1).range.end
    )
    edit.delete(tmpFileUri, fullRange)

    // write the new content
    edit.insert(tmpFileUri, new vscode.Position(0, 0), text)
    await vscode.workspace.applyEdit(edit)
  }

  const writeTextPart = async (textPart: string) => {
    const edit = new vscode.WorkspaceEdit()
    const position = new vscode.Position(tmpDocument.lineCount, 0)
    edit.insert(tmpDocument.uri, position, textPart)
    await vscode.workspace.applyEdit(edit)
  }

  const getText = () => tmpDocument.getText()

  const isClosedWithoutSaving = () => {
    if (tmpDocument.isClosed) {
      return !tmpDocument.getText()
    }
    return false
  }

  return {
    tmpDocument,
    writeText,
    writeTextPart,
    getText,
    isClosedWithoutSaving
  }
}
