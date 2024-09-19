import { IterableReadableStream } from '@langchain/core/utils/stream'

export const convertToIterableReadableStream = <T>(
  data: T
): IterableReadableStream<T> => {
  const readableStream = new ReadableStream({
    async start(controller) {
      controller.enqueue(data)
      controller.close()
    }
  })

  return IterableReadableStream.fromReadableStream(readableStream)
}
