import { getCurrentModelProvider } from '@/ai/helpers'
import { createLoading } from '@/loading'
import {
  removeCodeBlockEndSyntax,
  removeCodeBlockStartSyntax,
  removeCodeBlockSyntax,
  sleep
} from '@/utils'
import type { IterableReadableStream } from '@langchain/core/dist/utils/stream'
import type { AIMessageChunk } from '@langchain/core/messages'
import * as vscode from 'vscode'

export interface StreamingCompletionWriterOptions {
  editor: vscode.TextEditor
  buildAiStream: () => Promise<IterableReadableStream<AIMessageChunk>>
  onCancel?: () => void
}

/**
 * Writes the completion text from an AI stream to the editor.
 * @param options - The options for the streaming completion writer.
 * @returns A promise that resolves when the writing is complete.
 */
export const streamingCompletionWriter = async (
  options: StreamingCompletionWriterOptions
): Promise<void> => {
  const { editor, buildAiStream, onCancel } = options
  const ModelProvider = await getCurrentModelProvider()
  const { showProcessLoading, hideProcessLoading } = createLoading()
  const isClosedFile = () => editor.document.isClosed
  const initialPosition = editor.selection.active
  let currentPosition = initialPosition

  const dispose = () => {
    hideProcessLoading()
  }

  const writeTextPart = async (text: string) => {
    await editor.edit(
      editBuilder => {
        // only insert new text
        editBuilder.insert(currentPosition, text)
      },
      { undoStopBefore: false, undoStopAfter: false }
    )

    await sleep(10)

    // update current position to the end of the inserted text
    currentPosition = editor.document.positionAt(
      editor.document.offsetAt(currentPosition) + text.length
    )

    // update editor selection to the new cursor position
    editor.selection = new vscode.Selection(currentPosition, currentPosition)
  }

  const writeText = async (
    text: string,
    originPosition: vscode.Position,
    originText: string
  ) => {
    // override existing text if any
    const startOffset = editor.document.offsetAt(originPosition)
    const endOffset = startOffset + originText.length
    const endPosition = editor.document.positionAt(endOffset)
    const range = new vscode.Range(originPosition, endPosition)

    await editor.edit(
      editBuilder => {
        editBuilder.replace(range, text)
      },
      { undoStopBefore: false, undoStopAfter: false }
    )

    await sleep(10)

    // update current position to the end of the inserted text
    currentPosition = editor.document.positionAt(
      editor.document.offsetAt(originPosition) + text.length
    )

    // update editor selection
    editor.selection = new vscode.Selection(currentPosition, currentPosition)
  }

  try {
    showProcessLoading({
      onCancel
    })

    const aiStream = await buildAiStream()

    let fullText = ''
    for await (const chunk of aiStream) {
      if (isClosedFile()) {
        dispose()
        return
      }

      // convert openai answer content to text
      const text = ModelProvider.answerContentToText(chunk.content)

      if (!text) continue

      fullText += text

      await writeTextPart(text)

      // remove code block syntax
      // for example, remove ```python\n and \n```
      const cleanedText = removeCodeBlockStartSyntax(fullText)

      if (cleanedText !== fullText) {
        await writeText(cleanedText, initialPosition, fullText)
        fullText = cleanedText
      }
    }

    // remove code block syntax
    // for example, remove ```python\n and \n``` at the start and end
    // just confirm the code is clean
    const finalText = removeCodeBlockSyntax(removeCodeBlockEndSyntax(fullText))

    if (finalText !== fullText) {
      // write the final code
      await writeText(finalText, initialPosition, fullText)
    }

    // create an undo stop point after completion
    await editor.edit(() => {}, { undoStopBefore: true, undoStopAfter: true })

    await vscode.commands.executeCommand('editor.action.inlineSuggest.commit')
  } finally {
    dispose()
  }
}
