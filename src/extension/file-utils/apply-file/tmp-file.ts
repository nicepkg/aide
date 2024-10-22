import path from 'path'
import { getCurrentModelProvider } from '@extension/ai/helpers'
import { createLoading } from '@extension/loading'
import { logger } from '@extension/logger'
import {
  removeCodeBlockEndSyntax,
  removeCodeBlockStartSyntax,
  removeCodeBlockSyntax
} from '@extension/utils'
import { AIMessageChunk } from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'
import { getLanguageIdExt } from '@shared/utils/vscode-lang'
import * as vscode from 'vscode'

import { TmpFileStatus, type TmpFileYieldedChunk } from './types'

export enum TmpFileDefaults {
  TMP_FILE_IDENTIFIER = 'aide'
}

export interface CreateTmpFileOptions {
  originalFileUri: vscode.Uri
  ext?: string
  languageId?: string
  tmpFileUri?: vscode.Uri
  tmpFileIdentifier?: string
  silentMode?: boolean
  autoDiff?: boolean
  taskId?: string
}

export class TmpFile {
  readonly originalFileUri: vscode.Uri

  readonly tmpFileUri: vscode.Uri

  private tmpDocument!: vscode.TextDocument

  private languageId?: string

  private tmpFileIdentifier: string

  private status: TmpFileStatus = TmpFileStatus.IDLE

  private abortController: AbortController | null = null

  private silentMode: boolean

  private autoDiff: boolean

  private taskId?: string

  constructor(options: CreateTmpFileOptions) {
    this.originalFileUri = options.originalFileUri
    this.tmpFileIdentifier =
      options.tmpFileIdentifier ?? TmpFileDefaults.TMP_FILE_IDENTIFIER
    this.tmpFileUri = this.getTmpFileUri(options)
    this.languageId = options.languageId
    this.silentMode = options.silentMode ?? false
    this.autoDiff = options.autoDiff ?? false
    this.taskId = options.taskId
  }

  async initialize(): Promise<void> {
    try {
      this.tmpDocument = await vscode.workspace.openTextDocument(
        this.tmpFileUri
      )
      await this.showDocumentIfNotVisible()
      if (this.languageId) {
        vscode.languages.setTextDocumentLanguage(
          this.tmpDocument,
          this.languageId
        )
      }
      logger.log(`Initialized temporary file: ${this.tmpFileUri.fsPath}`)
    } catch (error) {
      logger.error(`Failed to initialize temporary file: ${error}`)
      throw error
    }
  }

  async showDiff(): Promise<void> {
    try {
      await vscode.commands.executeCommand(
        'aide.createDiff',
        this.originalFileUri,
        this.tmpFileUri,
        this.tmpFileUri.toString()
      )
      logger.log(`Showed diff for: ${this.tmpFileUri.fsPath}`)
    } catch (error) {
      logger.error(`Failed to show diff: ${error}`)
    }
  }

  async *processAiStream(
    buildAiStream: (
      abortController: AbortController
    ) => Promise<IterableReadableStream<AIMessageChunk>>,
    showLoading = false
  ): AsyncGenerator<TmpFileYieldedChunk> {
    if (this.status === TmpFileStatus.PROCESSING) {
      // stop and restart the stream
      this.interrupt()
    }

    this.status = TmpFileStatus.PROCESSING
    this.abortController = new AbortController()

    const ModelProvider = await getCurrentModelProvider()
    const { showProcessLoading, hideProcessLoading } = createLoading()

    try {
      showLoading && showProcessLoading({})
      const aiStream = await buildAiStream(this.abortController)
      yield* this.processStream(aiStream, ModelProvider)
      this.status = TmpFileStatus.COMPLETED
      logger.log(
        `Finished processing AI stream for: ${this.originalFileUri.fsPath}`
      )
    } catch (error) {
      this.status = TmpFileStatus.ERROR
      logger.error(`Error processing AI stream: ${error}`)
      throw error
    } finally {
      showLoading && hideProcessLoading()
      this.abortController = null
    }
  }

  private async *processStream(
    aiStream: IterableReadableStream<AIMessageChunk>,
    ModelProvider: any
  ): AsyncGenerator<TmpFileYieldedChunk> {
    let generatedContent = ''

    if (this.autoDiff) {
      await this.showDiff()
    }

    for await (const chunk of this.processStreamChunks(
      aiStream,
      ModelProvider
    )) {
      if (this.abortController?.signal.aborted) {
        this.status = TmpFileStatus.INTERRUPTED
        logger.log(`Processing interrupted for: ${this.originalFileUri.fsPath}`)
        yield { chunk: '', generatedContent, status: this.status }
        return
      }

      generatedContent += chunk
      generatedContent = removeCodeBlockStartSyntax(generatedContent)
      yield { chunk, generatedContent, status: this.status }

      if (!this.silentMode && this.isClosedWithoutSaving()) {
        this.status = TmpFileStatus.INTERRUPTED
        logger.log(`Processing stopped: file closed without saving`)
        yield { chunk: '', generatedContent, status: this.status }
        return
      }
      await this.writeTextPart(chunk)
      await this.cleanCodeBlockSyntax()
    }

    generatedContent = removeCodeBlockSyntax(
      removeCodeBlockEndSyntax(generatedContent)
    )

    await this.finalCleanup()

    yield { chunk: '', generatedContent, status: this.status }
  }

  private async *processStreamChunks(
    aiStream: IterableReadableStream<AIMessageChunk>,
    ModelProvider: any
  ): AsyncIterableIterator<string> {
    for await (const chunk of aiStream) {
      yield ModelProvider.answerContentToText(chunk.content)
    }
  }

  private async writeTextPart(textPart: string): Promise<void> {
    const edit = new vscode.WorkspaceEdit()
    const position = new vscode.Position(this.tmpDocument.lineCount, 0)
    edit.insert(this.tmpFileUri, position, textPart)
    await vscode.workspace.applyEdit(edit)
  }

  private async cleanCodeBlockSyntax(): Promise<void> {
    const currentText = this.tmpDocument.getText()
    const cleanedText = removeCodeBlockStartSyntax(currentText)
    if (cleanedText !== currentText) {
      await this.writeText(cleanedText)
    }
  }

  private async finalCleanup(): Promise<void> {
    const currentText = this.tmpDocument.getText()
    const finalText = removeCodeBlockSyntax(
      removeCodeBlockEndSyntax(currentText)
    )
    if (finalText !== currentText) {
      await this.writeText(finalText)
    }
  }

  private async writeText(text: string): Promise<void> {
    const edit = new vscode.WorkspaceEdit()
    const fullRange = new vscode.Range(
      new vscode.Position(0, 0),
      this.tmpDocument.lineAt(this.tmpDocument.lineCount - 1).range.end
    )
    edit.delete(this.tmpFileUri, fullRange)
    edit.insert(this.tmpFileUri, new vscode.Position(0, 0), text)
    await vscode.workspace.applyEdit(edit)
  }

  private async applyToOriginalFile(content: string): Promise<void> {
    const edit = new vscode.WorkspaceEdit()
    const document = await vscode.workspace.openTextDocument(
      this.originalFileUri
    )
    const fullRange = new vscode.Range(
      new vscode.Position(0, 0),
      document.lineAt(document.lineCount - 1).range.end
    )
    edit.replace(this.originalFileUri, fullRange, content)
    await vscode.workspace.applyEdit(edit)
    logger.log(
      `Applied changes to original file: ${this.originalFileUri.fsPath}`
    )
  }

  private async showDocumentIfNotVisible(): Promise<void> {
    if (this.silentMode) return

    const isDocumentAlreadyShown = vscode.window.visibleTextEditors.some(
      editor => editor.document.uri.toString() === this.tmpFileUri.toString()
    )
    if (!isDocumentAlreadyShown) {
      await vscode.window.showTextDocument(this.tmpDocument, {
        preview: false,
        viewColumn: vscode.ViewColumn.Beside
      })
    }
  }

  private isClosedWithoutSaving(): boolean {
    return this.tmpDocument.isClosed && !this.tmpDocument.getText()
  }

  private getTmpFileUri(options: CreateTmpFileOptions): vscode.Uri {
    const { ext, languageId, tmpFileUri, silentMode, taskId } = options

    if (tmpFileUri) return tmpFileUri

    const filePath = this.originalFileUri.fsPath
    const {
      dir: originalFileDir,
      name: originalFileName,
      ext: originalFileExt
    } = path.parse(filePath)
    const languageExt =
      ext ||
      (languageId ? getLanguageIdExt(languageId) : '') ||
      languageId ||
      originalFileExt.slice(1) ||
      ''
    const finalPath = path.join(
      originalFileDir,
      `${originalFileName}${originalFileExt}.${this.tmpFileIdentifier}${languageExt ? `.${languageExt}` : ''}`
    )

    if (!silentMode) return vscode.Uri.parse(`untitled:${finalPath}`)

    return vscode.Uri.parse(`aide:${finalPath}#${taskId}`)
  }

  interrupt(): void {
    if (this.status === TmpFileStatus.PROCESSING && this.abortController) {
      this.abortController.abort()
      this.status = TmpFileStatus.INTERRUPTED
    }
  }

  getStatus(): TmpFileStatus {
    return this.status
  }

  async close(): Promise<void> {
    try {
      if (!this.silentMode) {
        await vscode.commands.executeCommand(
          'aide.quickCloseFileWithoutSave',
          this.tmpFileUri
        )
      }
      logger.log(`Closed temporary file: ${this.tmpFileUri.fsPath}`)
    } catch (error) {
      logger.error(`Failed to close temporary file: ${error}`)
      throw error
    }
  }
}
