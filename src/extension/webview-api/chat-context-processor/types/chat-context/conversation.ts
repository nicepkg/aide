import type { MessageType } from '@langchain/core/messages'

import type { CodeContext } from './code-context'
import type { CodebaseContext } from './codebase-context'
import type { DocContext } from './doc-context'
import type { FileContext } from './file-context'
import type { GitContext } from './git-context'
import type { WebContext } from './web-context'

export interface Attachments {
  codebaseContext: CodebaseContext
  fileContext: FileContext
  codeContext: CodeContext
  webContext: WebContext
  docContext: DocContext
  gitContext: GitContext
}

export interface Conversation {
  id: string
  createdAt: number
  role: MessageType
  content: string
  richText?: string // JSON stringified
  attachments?: Attachments
}
