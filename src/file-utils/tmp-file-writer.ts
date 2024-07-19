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
  buildAiStream: () => Promise<IterableReadableStream<AIMessageChunk>>
  onCancel?: () => void
}

export const tmpFileWriter = async (
  options: TmpFileWriterOptions
): Promise<WriteTmpFileResult> => {
  const { buildAiStream, onCancel, ...createTmpFileOptions } = options

  const createTmpFileAndWriterReturns =
    await createTmpFileAndWriter(createTmpFileOptions)
  const { writeTextPart, getText, writeText, isClosedWithoutSaving } =
    createTmpFileAndWriterReturns

  const ModelProvider = await getCurrentModelProvider()
  const { showProcessLoading, hideProcessLoading } = createLoading()

  try {
    showProcessLoading({
      onCancel
    })
    const aiStream = await buildAiStream()

    for await (const chunk of aiStream) {
      if (isClosedWithoutSaving()) {
        hideProcessLoading()
        return createTmpFileAndWriterReturns
      }

      // convert openai answer content to text
      const text = ModelProvider.answerContentToText(chunk.content)
      await writeTextPart(text)

      // remove code block syntax
      // for example, remove ```python\n and \n```
      const currentCode = getText()
      const removeCodeBlockStartSyntaxCode =
        removeCodeBlockStartSyntax(currentCode)

      if (removeCodeBlockStartSyntaxCode !== currentCode) {
        await writeText(removeCodeBlockStartSyntaxCode)
      }
    }

    // remove code block end syntax
    // for example, remove \n``` at the end
    const currentCode = getText()
    const removeCodeBlockEndSyntaxCode = removeCodeBlockEndSyntax(currentCode)

    if (removeCodeBlockEndSyntaxCode !== currentCode) {
      await writeText(removeCodeBlockEndSyntaxCode)
    }

    // remove code block syntax
    // for example, remove ```python\n and \n``` at the start and end
    // just confirm the code is clean
    const finalCode = removeCodeBlockSyntax(getText())

    // write the final code
    await writeText(finalCode)
  } finally {
    hideProcessLoading()
  }

  return createTmpFileAndWriterReturns
}
