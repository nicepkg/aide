import { createModelProvider } from '@extension/ai/helpers'
import type { TmpFileYieldedChunk } from '@extension/file-utils/apply-file/types'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { DiffRegister } from '@extension/registers/diff-register'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import * as vscode from 'vscode'

import { Controller } from '../types'

export class ApplyController extends Controller {
  readonly name = 'apply'

  private get tmpFileManager() {
    return this.registerManager.getRegister(DiffRegister)?.tmpFileManager
  }

  async *applyCode(req: {
    path: string
    code: string
    silentMode?: boolean
    closeCurrentTmpFile?: boolean
  }): AsyncGenerator<TmpFileYieldedChunk> {
    if (!req.path || !req.code || !this.tmpFileManager) return

    const originalCode = await VsCodeFS.readFileOrOpenDocumentContent(req.path)

    const tmpFile = await this.tmpFileManager.createTmpFile({
      originalFileUri: vscode.Uri.file(req.path),
      silentMode: !!req.silentMode,
      autoDiff: true
    })

    if (req.closeCurrentTmpFile) {
      this.tmpFileManager.interruptProcessing(tmpFile.tmpFileUri)
    }

    const buildAiStream = async (abortController: AbortController) => {
      const modelProvider = await createModelProvider()
      const aiModel = (await modelProvider.getModel()).bind({
        signal: abortController.signal
      })
      const aiStream = aiModel.stream([
        new SystemMessage(
          `
You are a code editor assistant. You are given a file path and a code snippet. You need to apply the code snippet to the file at the given path.
The file path is ${req.path}.

The original code is:
${originalCode}

Your task is to apply the code snippet which from the user to the original code.
Don't reply with anything except the code.
`
        ),
        new HumanMessage(req.code)
      ])
      return aiStream
    }

    yield* tmpFile.processAiStream(buildAiStream)
  }

  async interruptApplyCode(req: { path: string }): Promise<void> {
    if (!req.path || !this.tmpFileManager) return

    const tmpFile = await this.tmpFileManager.createTmpFile({
      originalFileUri: vscode.Uri.file(req.path),
      silentMode: true
    })
    this.tmpFileManager.interruptProcessing(tmpFile.tmpFileUri)
  }

  async cleanupTmpFiles(): Promise<void> {
    if (!this.tmpFileManager) return

    await this.tmpFileManager.cleanupTmpFiles()
  }
}
