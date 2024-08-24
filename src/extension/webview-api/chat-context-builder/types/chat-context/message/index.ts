import type { AssistantSuggestions } from './assistant-suggestions'
import type { AttachmentInfo } from './attachment-info'
import type { BasicMessage } from './basic-message'
import type { CodeRelatedInfo } from './code-related-info'
import type { GitRelatedInfo } from './git-related-info'
import type { InterpreterInfo } from './interpreter-info'

export interface Message
  extends BasicMessage,
    CodeRelatedInfo,
    GitRelatedInfo,
    AssistantSuggestions,
    InterpreterInfo,
    AttachmentInfo {}
