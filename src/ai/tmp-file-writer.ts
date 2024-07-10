import {
  createTmpFileAndWriter,
  type CreateTmpFileOptions
} from '@/create-tmp-file'
import { hideLoading, showLoading } from '@/loading'
import {
  removeCodeBlockEndSyntax,
  removeCodeBlockStartSyntax,
  removeCodeBlockSyntax
} from '@/utils'
import type { IterableReadableStream } from '@langchain/core/dist/utils/stream'
import type { AIMessageChunk } from '@langchain/core/messages'

import { getCurrentModelProvider } from './model-providers'

export interface TmpFileWriterOptions extends CreateTmpFileOptions {
  buildAiStream: () => Promise<IterableReadableStream<AIMessageChunk>>
}

export const tmpFileWriter = async (options: TmpFileWriterOptions) => {
  const { buildAiStream, ...createTmpFileOptions } = options
  const { writeTextPart, getText, writeText, isClosedWithoutSaving } =
    await createTmpFileAndWriter(createTmpFileOptions)
  const ModelProvider = await getCurrentModelProvider()

  try {
    showLoading()
    const aiStream = await buildAiStream()

    for await (const chunk of aiStream) {
      if (isClosedWithoutSaving()) {
        hideLoading()
        return
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
    hideLoading()
  }
}
