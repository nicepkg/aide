import path from 'path'
import { t } from '@/i18n'
import { getLanguageId, getLanguageIdExt } from '@/utils'
import * as vscode from 'vscode'

/**
 * Returns a temporary file URI based on the original file URI and language ID.
 * @param originalFileUri The URI of the original file.
 * @param originalFileFullPath The full path of the original file.
 * @param languageId The language ID of the file.
 * @param untitled Indicates whether the temporary file is untitled.
 * @returns The temporary file URI.
 */
export const getTmpFileUri = ({
  originalFileUri,
  originalFileFullPath,
  languageId,
  ext,
  untitled = true
}: {
  originalFileUri?: vscode.Uri
  originalFileFullPath?: string
  languageId: string
  ext?: string
  untitled?: boolean
}) => {
  if (!originalFileUri && !originalFileFullPath)
    throw new Error(t('error.fileNotFound'))
  const filePath = originalFileFullPath || originalFileUri!.fsPath

  const originalFileDir = path.dirname(filePath)
  const originalFileName = path.parse(filePath).name
  const originalFileExt = path.parse(filePath).ext
  const languageExt = ext || getLanguageIdExt(languageId) || languageId

  const finalPath = path.join(
    originalFileDir,
    `${originalFileName}${originalFileExt}.aide${languageExt ? `.${languageExt}` : ''}`
  )

  if (!untitled) {
    return vscode.Uri.file(finalPath)
  }

  return vscode.Uri.parse(`untitled:${finalPath}`)
}

const aideTmpFileRegExp = /\.aide(\.[^.]+)?$/
export const isTmpFileUri = (uri: vscode.Uri, needUntitled = false) => {
  let _isTmpFileUri = aideTmpFileRegExp.test(uri.fsPath)

  if (needUntitled) {
    _isTmpFileUri = _isTmpFileUri && uri.scheme === 'untitled'
  }

  return _isTmpFileUri
}

/**
 * Retrieves the original file URI based on the temporary file URI.
 * If no temporary file URI is provided, it uses the URI of the active text editor.
 * If the temporary file URI is an Aide-generated file, it removes the Aide-specific suffix to get the original file URI.
 * If no original file URI is found, it throws an error.
 * @param tmpFileUri The temporary file URI.
 * @returns The original file URI.
 * @throws An error if no active text editor is found or if the file is not found.
 */
export const getOriginalFileUri = (tmpFileUri?: vscode.Uri) => {
  let maybeTmpFileUri = tmpFileUri
  const activeEditor = vscode.window.activeTextEditor

  if (!maybeTmpFileUri) {
    if (!activeEditor) {
      throw new Error(t('error.noActiveEditor'))
    }
    maybeTmpFileUri = activeEditor.document.uri
  }

  const tmpFileIsAideGenerated = isTmpFileUri(maybeTmpFileUri)

  let originalFileUri

  if (tmpFileIsAideGenerated) {
    originalFileUri = vscode.Uri.file(
      maybeTmpFileUri.fsPath.replace(aideTmpFileRegExp, '')
    )
  } else {
    if (!activeEditor) {
      throw new Error(t('error.noActiveEditor'))
    }
    originalFileUri = activeEditor.document.uri
  }

  if (!originalFileUri) throw new Error(t('error.fileNotFound'))

  return originalFileUri
}

/**
 * Represents information about a temporary file.
 */
export interface TmpFileInfo {
  /**
   * The URI of the original file.
   */
  originalFileUri: vscode.Uri

  /**
   * The text document of the original file.
   */
  originalFileDocument: vscode.TextDocument

  /**
   * The content of the original file.
   */
  originalFileContent: string

  /**
   * The language ID of the original file.
   */
  originalFileLanguageId: string

  /**
   * The extension of the original file.
   */
  originalFileExt: string

  /**
   * Indicates whether the active file is the original file.
   */
  activeIsOriginalFile: boolean

  /**
   * Indicates whether the selection is a temporary file.
   */
  isSelection: boolean

  /**
   * The URI of the temporary file.
   */
  tmpFileUri: vscode.Uri

  /**
   * Indicates whether the temporary file exists.
   */
  isTmpFileExists?: boolean

  /**
   * Indicates whether the temporary file has content.
   */
  isTmpFileHasContent?: boolean
}

/**
 * Creates temporary file information.
 * @returns A promise that resolves to a `TmpFileInfo` object.
 * @throws An error if there is no active editor.
 */
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
    originalFileLanguageId,
    originalFileExt,
    activeIsOriginalFile,
    isSelection,
    tmpFileUri,
    isTmpFileExists,
    isTmpFileHasContent
  }
}

export interface CreateTmpFileOptions {
  ext?: string
  languageId?: string
  tmpFileUri?: vscode.Uri
}

/**
 * Represents the result of writing a temporary file.
 */
export interface WriteTmpFileResult {
  /**
   * The original file URI.
   */
  originalFileUri: vscode.Uri

  /**
   * The temporary file URI.
   */
  tmpFileUri: vscode.Uri

  /**
   * The temporary document.
   */
  tmpDocument: vscode.TextDocument

  /**
   * Writes the specified text to the temporary file.
   * @param text The text to write.
   */
  writeText: (text: string) => Promise<void>

  /**
   * Writes the specified text part to the temporary file.
   * @param textPart The text part to write.
   */
  writeTextPart: (textPart: string) => Promise<void>

  /**
   * Gets the text of the temporary file.
   * @returns The text of the temporary file.
   */
  getText: () => string

  /**
   * Saves the temporary file.
   * @returns A promise that resolves when the temporary file is saved.
   */
  save: () => Promise<void>

  /**
   * Closes the temporary file.
   * @returns A promise that resolves when the temporary file is closed.
   */
  close: () => Promise<void>

  /**
   * Checks if the temporary file was closed without saving.
   * @returns A boolean indicating if the temporary file was closed without saving.
   */
  isClosedWithoutSaving: () => boolean
}

/**
 * Creates a temporary file and returns a writer object with various utility functions.
 * @param options - The options for creating the temporary file.
 * @returns A promise that resolves to a `WriteTmpFileResult` object.
 */
export const createTmpFileAndWriter = async (
  options: CreateTmpFileOptions
): Promise<WriteTmpFileResult> => {
  if (!options.languageId && !options.tmpFileUri)
    throw new Error(
      "createTmpFileAndWriter: Either 'languageId' or 'tmpFileUri' must be provided."
    )

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
  const isDocumentAlreadyShown = vscode.window.visibleTextEditors.some(
    editor => editor.document.uri.toString() === tmpDocument.uri.toString()
  )

  if (!isDocumentAlreadyShown) {
    await vscode.window.showTextDocument(tmpDocument, {
      preview: false,
      viewColumn: vscode.ViewColumn.Beside
    })
  }

  if (languageId) {
    vscode.languages.setTextDocumentLanguage(tmpDocument, languageId)
  }

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

  const save = async () => {
    await tmpDocument.save()
  }

  const close = async () => {
    await vscode.commands.executeCommand(
      'aide.quickCloseFileWithoutSave',
      tmpFileUri
    )
  }

  const isClosedWithoutSaving = () => {
    if (tmpDocument.isClosed) {
      return !tmpDocument.getText()
    }
    return false
  }

  return {
    originalFileUri,
    tmpFileUri,
    tmpDocument,
    writeText,
    writeTextPart,
    getText,
    save,
    close,
    isClosedWithoutSaving
  }
}
