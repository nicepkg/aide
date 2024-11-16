import { ModelProviderFactory } from '@extension/ai/model-providers/helpers/factory'
import { createLoading } from '@extension/loading'
import {
  removeCodeBlockEndSyntax,
  removeCodeBlockStartSyntax,
  removeCodeBlockSyntax
} from '@extension/utils'
import type { AIMessageChunk } from '@langchain/core/messages'
import type { IterableReadableStream } from '@langchain/core/utils/stream'

import {
  createTmpFileAndWriter,
  type CreateTmpFileOptions,
  type WriteTmpFileResult
} from './create-tmp-file-and-writer'

export interface TmpFileWriterOptions {
  tmpFileOptions: CreateTmpFileOptions
  stopWriteWhenClosed?: boolean
  enableProcessLoading?: boolean
  autoSaveWhenDone?: boolean
  autoCloseWhenDone?: boolean
  buildAiStream: () => Promise<IterableReadableStream<AIMessageChunk>>
  onCancel?: () => void
}

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
    tmpFileOptions
  } = options

  const writer = await createTmpFileAndWriter(tmpFileOptions)
  const { showProcessLoading, hideProcessLoading } = createLoading()

  try {
    if (enableProcessLoading) {
      showProcessLoading({ onCancel })
    }

    await processAiStream(writer, buildAiStream, stopWriteWhenClosed)

    if (autoSaveWhenDone) {
      await writer.save()
    }

    if (autoCloseWhenDone) {
      await writer.close()
    }
  } finally {
    if (enableProcessLoading) {
      hideProcessLoading()
    }
  }

  return writer
}

const processAiStream = async (
  writer: WriteTmpFileResult,
  buildAiStream: () => Promise<IterableReadableStream<AIMessageChunk>>,
  stopWriteWhenClosed: boolean
) => {
  const aiStream = await buildAiStream()

  for await (const chunk of aiStream) {
    if (stopWriteWhenClosed && writer.isClosedWithoutSaving()) {
      return
    }

    const text = ModelProviderFactory.formatMessageContent(chunk.content)
    await writer.writeTextPart(text)

    await cleanCodeBlockSyntax(writer)
  }

  await finalCleanup(writer)
}

const cleanCodeBlockSyntax = async (writer: WriteTmpFileResult) => {
  const currentText = writer.getText()
  const cleanedText = removeCodeBlockStartSyntax(currentText)

  if (cleanedText !== currentText) {
    await writer.writeText(cleanedText)
  }
}

const finalCleanup = async (writer: WriteTmpFileResult) => {
  const currentText = writer.getText()
  const finalText = removeCodeBlockSyntax(removeCodeBlockEndSyntax(currentText))

  if (finalText !== currentText) {
    await writer.writeText(finalText)
  }
}
