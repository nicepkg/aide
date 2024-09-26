import type { CodeSnippet } from '../types/chat-context'

export type CodeChunkRow = Omit<CodeSnippet, 'code'> & {
  embedding: number[]
}
