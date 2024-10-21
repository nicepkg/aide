import { logger } from '@extension/logger'
import { getActiveEditor } from '@extension/utils'
import { AIMessageChunk } from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'
import * as vscode from 'vscode'

import {
  CreateTmpFileOptions as ICreateTmpFileOptions,
  TmpFile,
  TmpFileDefaults
} from './tmp-file'
import type { TmpFileStatus } from './types'

type CreateTmpFileOptions = Omit<ICreateTmpFileOptions, 'originalFileUri'> & {
  originalFileUri?: vscode.Uri
}

interface AiChange extends ICreateTmpFileOptions {
  buildAiStream: () => Promise<IterableReadableStream<AIMessageChunk>>
}

export interface TmpFileManagerOptions {
  tmpFileIdentifier?: string
}

export class TmpFileManager {
  private tmpFiles: Map<string, TmpFile> = new Map()

  private tmpFileIdentifier: string

  constructor(options: TmpFileManagerOptions = {}) {
    this.tmpFileIdentifier =
      options.tmpFileIdentifier ?? TmpFileDefaults.TMP_FILE_IDENTIFIER
  }

  async createTmpFile(options: CreateTmpFileOptions): Promise<TmpFile> {
    try {
      const originalFileUri =
        options.originalFileUri || this.getOriginalFileUri(options.tmpFileUri)
      const tmpFile = new TmpFile({
        ...options,
        originalFileUri,
        tmpFileIdentifier: this.tmpFileIdentifier
      })
      await tmpFile.initialize()
      this.tmpFiles.set(tmpFile.tmpFileUri.fsPath, tmpFile)
      logger.log(`Created temporary file: ${tmpFile.tmpFileUri.fsPath}`)
      return tmpFile
    } catch (error) {
      logger.error(`Failed to create temporary file: ${error}`)
      throw error
    }
  }

  async processBatchAiChanges(changes: AiChange[]): Promise<void> {
    for (const change of changes) {
      try {
        const { buildAiStream, ...options } = change
        const tmpFile = await this.createTmpFile(options)
        await tmpFile.processAiStream(buildAiStream)
      } catch (error) {
        logger.error(`Failed to process AI change: ${error}`)
      }
    }
  }

  async showDiffs(): Promise<void> {
    for (const tmpFile of this.tmpFiles.values()) {
      try {
        await tmpFile.showDiff()
        logger.log(`Showed diff for: ${tmpFile.tmpFileUri.fsPath}`)
      } catch (error) {
        logger.error(`Failed to show diff: ${error}`)
      }
    }
  }

  async cleanupTmpFiles(): Promise<void> {
    for (const tmpFile of this.tmpFiles.values()) {
      try {
        await tmpFile.close()
        logger.log(`Closed temporary file: ${tmpFile.tmpFileUri.fsPath}`)
      } catch (error) {
        logger.error(`Failed to close temporary file: ${error}`)
      }
    }
    this.tmpFiles.clear()
  }

  interruptProcessing(tmpFileUri: vscode.Uri): void {
    const tmpFile = this.tmpFiles.get(tmpFileUri.fsPath)
    if (tmpFile) {
      tmpFile.interrupt()
    }
  }

  getProcessingStatus(tmpFileUri: vscode.Uri): TmpFileStatus | undefined {
    const tmpFile = this.tmpFiles.get(tmpFileUri.fsPath)
    return tmpFile?.getStatus()
  }

  private getOriginalFileUri(tmpFileUri?: vscode.Uri): vscode.Uri {
    const fileUri = tmpFileUri ?? getActiveEditor()?.document.uri
    if (!fileUri) {
      throw new Error('No active editor or temporary file URI provided')
    }
    const isAideGeneratedFile = this.isTmpFileUri(fileUri)
    return isAideGeneratedFile
      ? vscode.Uri.file(fileUri.fsPath.replace(this.getTmpFileRegex(), ''))
      : fileUri
  }

  private isTmpFileUri(uri: vscode.Uri, requireUntitled = false): boolean {
    const isTmpFile = this.getTmpFileRegex().test(uri.fsPath)
    return requireUntitled ? isTmpFile && uri.scheme === 'untitled' : isTmpFile
  }

  private getTmpFileRegex(): RegExp {
    return new RegExp(`\\.${this.tmpFileIdentifier}(\\.[^.]+)?$`)
  }
}
