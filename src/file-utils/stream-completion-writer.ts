import { getCurrentModelProvider } from '@/ai/helpers'
import { createLoading } from '@/loading'
import {
  removeCodeBlockEndSyntax,
  removeCodeBlockStartSyntax,
  removeCodeBlockSyntax
} from '@/utils'
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
  const isClosedFile = () => editor.document.isClosed
  const initialPosition = editor.selection.active
  let currentPosition = initialPosition

  const dispose = () => {
    hideProcessLoading()
  }

  try {
    showProcessLoading({
      onCancel
    })

    const aiStream = await buildAiStream()

    const writeTextPart = async (text: string) => {
      await editor.edit(
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        editBuilder => {
          // only insert new text
          editBuilder.insert(currentPosition, text)
        },
        { undoStopBefore: false, undoStopAfter: false }
      )

      // update current position to the end of the inserted text
      currentPosition = editor.document.positionAt(
        editor.document.offsetAt(currentPosition) + text.length
      )
    }

    const writeText = async (text: string, originPosition: vscode.Position) => {
      // override existing text if any
      const endPosition = editor.document.positionAt(
        editor.document.offsetAt(originPosition) + text.length
      )
      const range = new vscode.Range(originPosition, endPosition)

      await editor.edit(
        editBuilder => {
          editBuilder.replace(range, text)
        },
        { undoStopBefore: false, undoStopAfter: false }
      )

      // update current position to the end of the inserted text
      currentPosition = editor.document.positionAt(
        editor.document.offsetAt(originPosition) + text.length
      )

      // update editor selection
      editor.selection = new vscode.Selection(currentPosition, currentPosition)
    }

    let fullText = ''
    for await (const chunk of aiStream) {
      if (isClosedFile()) {
        dispose()
        return
      }

      // convert openai answer content to text
      const text = ModelProvider.answerContentToText(chunk.content)
      fullText += text

      await writeTextPart(text)

      // remove code block syntax
      // for example, remove ```python\n and \n```
      const removeCodeBlockStartSyntaxCode =
        removeCodeBlockStartSyntax(fullText)

      if (removeCodeBlockStartSyntaxCode !== fullText) {
        await writeText(removeCodeBlockStartSyntaxCode, initialPosition)
      }
    }

    // remove code block end syntax
    // for example, remove \n``` at the end
    const removeCodeBlockEndSyntaxCode = removeCodeBlockEndSyntax(fullText)

    if (removeCodeBlockEndSyntaxCode !== fullText) {
      await writeText(removeCodeBlockEndSyntaxCode, initialPosition)
    }

    // remove code block syntax
    // for example, remove ```python\n and \n``` at the start and end
    // just confirm the code is clean
    const finalCode = removeCodeBlockSyntax(fullText)

    // write the final code
    await writeText(finalCode, initialPosition)

    // create an undo stop point after completion
    await editor.edit(() => {}, { undoStopBefore: true, undoStopAfter: true })

    await vscode.commands.executeCommand('editor.action.inlineSuggest.commit')
  } finally {
    dispose()
  }
}
