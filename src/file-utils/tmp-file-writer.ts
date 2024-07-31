import { getCurrentModelProvider } from '@/ai/helpers'
import { createLoading } from '@/loading'
import {
  removeCodeBlockEndSyntax,
  removeCodeBlockStartSyntax,
  removeCodeBlockSyntax
} from '@/utils'
import type { IterableReadableStream } from '@langchain/core/dist/utils/stream'
import type { AIMessageChunk } from '@langchain/core/messages'

import {
  createTmpFileAndWriter,
  type CreateTmpFileOptions,
  type WriteTmpFileResult
} from './create-tmp-file'

export interface TmpFileWriterOptions extends CreateTmpFileOptions {
  stopWriteWhenClosed?: boolean
  enableProcessLoading?: boolean
  autoSaveWhenDone?: boolean
  autoCloseWhenDone?: boolean
  buildAiStream: () => Promise<IterableReadableStream<AIMessageChunk>>
  onCancel?: () => void
}

/**
 * Writes temporary file with AI-generated content.
 *
 * @param options - The options for writing the temporary file.
 * @returns A promise that resolves to the result of writing the temporary file.
 */
export const tmpFileWriter = async (
  options: TmpFileWriterOptions
): Promise<WriteTmpFileResult> => {
  const {
    buildAiStream,
    onCancel,
    stopWriteWhenClosed = true,
    enableProcessLoading = true,
    autoSaveWhenDone = false,
    autoCloseWhenDone = false,
    ...createTmpFileOptions
  } = options

  const createTmpFileAndWriterReturns =
    await createTmpFileAndWriter(createTmpFileOptions)
  const {
    writeTextPart,
    getText,
    writeText,
    save,
    close,
    isClosedWithoutSaving
  } = createTmpFileAndWriterReturns

  const ModelProvider = await getCurrentModelProvider()
  const { showProcessLoading, hideProcessLoading } = createLoading()

  try {
    enableProcessLoading &&
      showProcessLoading({
        onCancel
      })

    const aiStream = await buildAiStream()

    for await (const chunk of aiStream) {
      if (stopWriteWhenClosed && isClosedWithoutSaving()) {
        enableProcessLoading && hideProcessLoading()
        return createTmpFileAndWriterReturns
      }

      // convert openai answer content to text
      const text = ModelProvider.answerContentToText(chunk.content)
      await writeTextPart(text)

      // remove code block syntax
      // for example, remove ```python\n and \n```
      const currentText = getText()
      const cleanedText = removeCodeBlockStartSyntax(currentText)

      if (cleanedText !== currentText) {
        await writeText(cleanedText)
      }
    }

    // remove code block syntax
    // for example, remove ```python\n and \n``` at the start and end
    // just confirm the code is clean
    const currentText = getText()
    const finalText = removeCodeBlockSyntax(
      removeCodeBlockEndSyntax(currentText)
    )

    if (finalText !== currentText) {
      // write the final code
      await writeText(finalText)
    }

    if (autoSaveWhenDone) save()

    if (autoCloseWhenDone) close()
  } finally {
    enableProcessLoading && hideProcessLoading()
  }

  return createTmpFileAndWriterReturns
}
