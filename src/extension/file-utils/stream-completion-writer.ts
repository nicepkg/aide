import { getCurrentModelProvider } from '@extension/ai/helpers'
import { createLoading } from '@extension/loading'
import {
  removeCodeBlockEndSyntax,
  removeCodeBlockStartSyntax,
  removeCodeBlockSyntax,
  sleep
} from '@extension/utils'
import type { IterableReadableStream } from '@langchain/core/dist/utils/stream'
import type { AIMessageChunk } from '@langchain/core/messages'
import * as vscode from 'vscode'

export interface StreamingCompletionWriterOptions {
  editor: vscode.TextEditor
  buildAiStream: () => Promise<IterableReadableStream<AIMessageChunk>>
  onCancel?: () => void
}

export const streamingCompletionWriter = async (
  options: StreamingCompletionWriterOptions
): Promise<void> => {
  const { editor, buildAiStream, onCancel } = options
  const ModelProvider = await getCurrentModelProvider()
  const { showProcessLoading, hideProcessLoading } = createLoading()
  const initialPosition = editor.selection.active
  const writer = new EditorWriter(editor, initialPosition)

  try {
    showProcessLoading({ onCancel })
    const aiStream = await buildAiStream()
    await processAiStream(aiStream, ModelProvider, writer)
    await finalizeEditing(editor)
  } finally {
    hideProcessLoading()
  }
}

export const processAiStream = async (
  aiStream: IterableReadableStream<AIMessageChunk>,
  ModelProvider: any,
  writer: EditorWriter
): Promise<void> => {
  let fullText = ''
  for await (const chunk of aiStream) {
    if (writer.isDocumentClosed()) {
      return
    }

    const text = ModelProvider.answerContentToText(chunk.content)
    if (!text) continue

    fullText += text
    await writer.writeTextPart(text)

    const cleanedText = removeCodeBlockStartSyntax(fullText)
    if (cleanedText !== fullText) {
      await writer.writeText(cleanedText, fullText.length)
      fullText = cleanedText
    }
  }

  const finalText = removeCodeBlockSyntax(removeCodeBlockEndSyntax(fullText))
  if (finalText !== fullText) {
    await writer.writeText(finalText, fullText.length)
  }
}

export const finalizeEditing = async (
  editor: vscode.TextEditor
): Promise<void> => {
  await editor.edit(() => {}, { undoStopBefore: true, undoStopAfter: true })
}

class EditorWriter {
  private currentPosition: vscode.Position

  constructor(
    private editor: vscode.TextEditor,
    private initialPosition: vscode.Position
  ) {
    this.currentPosition = initialPosition
  }

  async writeTextPart(text: string): Promise<void> {
    await this.editor.edit(
      editBuilder => {
        editBuilder.insert(this.currentPosition, text)
      },
      { undoStopBefore: false, undoStopAfter: false }
    )

    await sleep(10)
    this.updatePosition(this.currentPosition, text.length)
  }

  async writeText(text: string, fullTextLength: number): Promise<void> {
    const range = this.getReplacementRange(fullTextLength)

    await this.editor.edit(
      editBuilder => {
        editBuilder.replace(range, text)
      },
      { undoStopBefore: false, undoStopAfter: false }
    )

    await sleep(10)
    this.updatePosition(this.initialPosition, text.length)
  }

  private updatePosition(
    startPosition: vscode.Position,
    textLength: number
  ): void {
    this.currentPosition = this.editor.document.positionAt(
      this.editor.document.offsetAt(startPosition) + textLength
    )
    this.editor.selection = new vscode.Selection(
      this.currentPosition,
      this.currentPosition
    )
  }

  private getReplacementRange(fullTextLength: number): vscode.Range {
    const startOffset = this.editor.document.offsetAt(this.initialPosition)
    const endOffset = startOffset + fullTextLength
    const endPosition = this.editor.document.positionAt(endOffset)
    return new vscode.Range(this.initialPosition, endPosition)
  }

  isDocumentClosed(): boolean {
    return this.editor.document.isClosed
  }
}
