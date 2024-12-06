import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'
import { logger } from '@webview/utils/logger'
import { noop } from 'es-toolkit'

const convertEncoding = (
  input: string,
  fromEncoding: BufferEncoding,
  toEncoding: BufferEncoding
): string => {
  if (fromEncoding === toEncoding) {
    return input
  }

  if (toEncoding === 'base64') {
    return btoa(unescape(encodeURIComponent(input)))
  }
  if (fromEncoding === 'base64') {
    return decodeURIComponent(escape(atob(input)))
  }
  if (toEncoding === 'hex') {
    return Array.from(new TextEncoder().encode(input))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  if (fromEncoding === 'hex') {
    return new TextDecoder().decode(
      new Uint8Array(input.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
    )
  }

  try {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder(toEncoding)
    return decoder.decode(encoder.encode(input))
  } catch (error) {
    logger.error('Encoding conversion failed:', error)
    return input
  }
}

export const useReadFile = (props: {
  filePath: string
  content?: string
  encoding?: BufferEncoding
}) => {
  const { filePath, content, encoding } = props

  return useQuery({
    queryKey: ['realtime', 'read-file', filePath, encoding],
    queryFn: ({ signal }) =>
      api.file.readFile({ path: filePath, encoding }, noop, signal),
    enabled: Boolean(filePath && !content),
    initialData: content
      ? convertEncoding(content, 'utf-8', encoding || 'utf-8')
      : undefined
  })
}
