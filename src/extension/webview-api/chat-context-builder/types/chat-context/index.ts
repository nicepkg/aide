import type { CodeBlock } from './code-block'
import type { FileUri } from './file-uri'
import type { Message } from './message'
import type { RichText } from './rich-text'

export interface IFileContext {
  focusedFiles: {
    uri: FileUri
    fileName: string
  }[]
  suggestedFiles: any[]
  newlyCreatedFiles: {
    uri: FileUri
  }[]
  newlyCreatedFolders: any[]
  deleteFileSuggestions: any[]
  isReadingLongFile: boolean
  hasAddedFiles: boolean
  codeBlockData: Record<
    string,
    {
      /**
       * @example 0
       */
      version: number

      /**
       * @example {
       *   fsPath:
       *      '/Users/xxx/Documents/codes/aide/src/extension/file-utils/create-should-ignore.ts',
       *    external:
       *      'file:///Users/xxx/Documents/codes/aide/src/extension/file-utils/create-should-ignore.ts',
       *    path: '/Users/xxx/Documents/codes/aide/src/extension/file-utils/create-should-ignore.ts',
       *    scheme: 'file'
       *  }
       */
      predictedUri: FileUri

      /**
       * @example {
       *    fsPath:
       *      '/Users/xxx/Documents/codes/aide/src/extension/file-utils/create-should-ignore.ts',
       *    external:
       *      'file:///Users/xxx/Documents/codes/aide/src/extension/file-utils/create-should-ignore.ts',
       *    path: '/Users/xxx/Documents/codes/aide/src/extension/file-utils/create-should-ignore.ts',
       *    scheme: 'file'
       */
      uri: FileUri

      /**
       * @example 'completed'
       */
      status: string

      /**
       * @example [
       *   "export const createShouldIgnore = (file: string) => {",
       *   "  return file.startsWith('.') || file.startsWith('node_modules')",
       *   "}"
       * ]
       */
      newModelLines: string[]

      /**
       * @example [" "]
       */
      originalModelLines: string[]
    }[]
  >
}

export interface IConversationContext {
  conversation: Message[]
  references: {
    selections: any[]
    fileSelections: any[]
    folderSelections: any[]
    useWeb: boolean
    useCodebase: boolean
  }
  codeSelections: any[]
  richText?: RichText
  plainText: string
}

export interface ISettingsContext {
  modelName: string
  useFastApply: boolean
  fastApplyModelName?: string
  useChunkSpeculationForLongFiles: boolean
  explicitContext: {
    /**
     * Explicit context provided.
     * @example '总是说中文'
     */
    context: string
  }
  clickedCodeBlockContents: string
  allowLongFileScan: boolean
}

export interface IBaseContext {
  tabs:
    | {
        type: 'composer'
      }
    | {
        type: 'code'
        codeBlocks: CodeBlock[]
      }[]

  createdAt: number
  lastUpdatedAt: number
}

export interface ChatContext
  extends IBaseContext,
    IFileContext,
    IConversationContext,
    ISettingsContext {}
