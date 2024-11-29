import {
  AI_SUPPORT_IMG_EXT,
  IGNORE_FILETYPES_WITHOUT_IMG
} from '@extension/constants'
import { createShouldIgnore } from '@extension/file-utils/ignore-patterns'
import {
  traverseFileOrFolders,
  type FileInfo
} from '@extension/file-utils/traverse-fs'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { logger } from '@extension/logger'
import { getWorkspaceFolder } from '@extension/utils'
import type { BaseStrategyOptions } from '@extension/webview-api/chat-context-processor/strategies/base-strategy'
import type {
  ChatGraphNode,
  ChatGraphState
} from '@extension/webview-api/chat-context-processor/strategies/chat-strategy/nodes/state'
import { formatCodeSnippet } from '@extension/webview-api/chat-context-processor/utils/code-snippet-formatter'
import { getFileContent } from '@extension/webview-api/chat-context-processor/utils/get-file-content'
import type { StructuredTool } from '@langchain/core/tools'
import type { ChatContext, Conversation } from '@shared/entities'
import type { ChatStrategyProvider } from '@shared/plugins/base/server/create-provider-manager'
import { PluginId } from '@shared/plugins/base/types'
import { mergeCodeSnippets } from '@shared/plugins/fs-plugin/server/merge-code-snippets'
import { removeDuplicates } from '@shared/utils/common'

import type { EditorError, FsPluginState } from '../../types'
import {
  createCodebaseSearchNode,
  createCodebaseSearchTool
} from './codebase-search-node'
import { createFsVisitNode, createFsVisitTool } from './fs-visit-node'

interface BuildFilePromptsResult {
  selectedFilesPrompt: string
  currentFilesPrompt: string
  imageBase64Urls: string[]
  treePrompt: string
}

export class FsChatStrategyProvider implements ChatStrategyProvider {
  async buildSystemMessagePrompt(chatContext: ChatContext): Promise<string> {
    const hasAttachedFiles = this.checkForAttachedFiles(chatContext)

    return hasAttachedFiles
      ? CHAT_WITH_FILE_SYSTEM_PROMPT
      : COMMON_SYSTEM_PROMPT
  }

  async buildContextMessagePrompt(conversation: Conversation): Promise<string> {
    const state = conversation.pluginStates?.[PluginId.Fs] as
      | Partial<FsPluginState>
      | undefined

    if (!state) return ''

    const codeSnippetsPrompt = await this.buildCodeSnippetsPrompt(state)
    codeSnippetsPrompt &&
      logger.dev.verbose('codeSnippetsPrompt', codeSnippetsPrompt)

    const editorErrorsPrompt = this.buildEditorErrorsPrompt(state)
    editorErrorsPrompt &&
      logger.dev.verbose('editorErrorsPrompt', editorErrorsPrompt)

    const { currentFilesPrompt } = await this.buildFilePrompts(state)
    const prompts = [
      codeSnippetsPrompt,
      currentFilesPrompt,
      editorErrorsPrompt
    ].filter(Boolean)

    return prompts.join('\n\n')
  }

  async buildHumanMessagePrompt(conversation: Conversation): Promise<string> {
    const state = conversation.pluginStates?.[PluginId.Fs] as
      | Partial<FsPluginState>
      | undefined

    if (!state) return ''

    const { selectedFilesPrompt, treePrompt } =
      await this.buildFilePrompts(state)
    const codeChunksPrompt = this.buildCodeChunksPrompt(state)

    return `
${treePrompt}
${selectedFilesPrompt}
${codeChunksPrompt}`
  }

  async buildHumanMessageEndPrompt(
    conversation: Conversation,
    chatContext: ChatContext
  ): Promise<string> {
    const hasAttachedFiles = this.checkForAttachedFiles(chatContext)
    const fileContextPrompt = hasAttachedFiles ? FILE_CONTEXT_PROMPT : ''

    return fileContextPrompt
  }

  async buildHumanMessageImageUrls(
    conversation: Conversation
  ): Promise<string[]> {
    const state = conversation.pluginStates?.[PluginId.Fs] as
      | Partial<FsPluginState>
      | undefined

    if (!state) return []

    const { selectedImagesFromOutsideUrl } = state
    const { imageBase64Urls } = await this.buildFilePrompts(state)
    return removeDuplicates([
      ...(selectedImagesFromOutsideUrl?.map(image => image.url) || []),
      ...imageBase64Urls
    ])
  }

  async buildAgentTools(
    options: BaseStrategyOptions,
    state: ChatGraphState
  ): Promise<StructuredTool[]> {
    const tools = await Promise.all([
      createCodebaseSearchTool(options, state),
      createFsVisitTool(options, state)
    ])
    return tools.filter(Boolean) as StructuredTool[]
  }

  async buildLanggraphToolNodes(
    options: BaseStrategyOptions
  ): Promise<ChatGraphNode[]> {
    return [createCodebaseSearchNode(options), createFsVisitNode(options)]
  }

  private checkForAttachedFiles(chatContext: ChatContext): boolean {
    return chatContext.conversations.some(conversation => {
      const {
        selectedFilesFromEditor = [],
        selectedFoldersFromEditor = [],
        codeSnippetFromAgent = []
      } = (conversation.pluginStates?.[PluginId.Fs] as
        | Partial<FsPluginState>
        | undefined) || {}

      return (
        selectedFilesFromEditor.length > 0 ||
        selectedFoldersFromEditor.length > 0 ||
        codeSnippetFromAgent.length > 0
      )
    })
  }

  private async buildFilePrompts(
    state: Partial<FsPluginState>
  ): Promise<BuildFilePromptsResult> {
    const result: BuildFilePromptsResult = {
      selectedFilesPrompt: '',
      currentFilesPrompt: '',
      imageBase64Urls: [],
      treePrompt: ''
    }

    const workspacePath = getWorkspaceFolder().uri.fsPath
    const currentFilePaths = new Set(
      state.currentFilesFromVSCode?.map(file => file.fullPath)
    )
    const processedFiles = new Set<string>()

    const filesOrFolders = removeDuplicates(
      [
        ...(state.selectedFilesFromEditor || []),
        ...(state.selectedFilesFromFileSelector || []),
        ...(state.selectedFoldersFromEditor || []),
        ...(state.selectedFilesFromAgent || [])
      ],
      ['fullPath']
    ).map(file => file.fullPath)

    const shouldIgnore = await createShouldIgnore(
      workspacePath,
      IGNORE_FILETYPES_WITHOUT_IMG
    )

    await traverseFileOrFolders({
      type: 'file',
      filesOrFolders,
      workspacePath,
      customShouldIgnore: shouldIgnore,
      itemCallback: async (fileInfo: FileInfo) => {
        if (processedFiles.has(fileInfo.fullPath)) return

        if (
          AI_SUPPORT_IMG_EXT.some(ext =>
            fileInfo.fullPath.toLowerCase().endsWith(`.${ext}`)
          )
        ) {
          const fileContent = await VsCodeFS.readFile(
            fileInfo.fullPath,
            'base64'
          )
          result.imageBase64Urls.push(fileContent)
        } else {
          const fileContent = await getFileContent(fileInfo)
          const formattedSnippet = formatCodeSnippet({
            relativePath: fileInfo.relativePath,
            code: fileContent,
            showLine: false
          })
          if (currentFilePaths.has(fileInfo.fullPath)) {
            result.currentFilesPrompt += formattedSnippet
          } else {
            result.selectedFilesPrompt += formattedSnippet
          }
        }

        processedFiles.add(fileInfo.fullPath)
      }
    })

    if (state.selectedTreesFromEditor?.length) {
      result.treePrompt = `
## Some Project Structure

${state.selectedTreesFromEditor.map(tree => tree.listString).join('\n')}
`
    }

    if (result.currentFilesPrompt) {
      result.currentFilesPrompt = `
## Current Files
Here is the file I'm looking at. It might be truncated from above and below and, if so, is centered around my cursor.

${result.currentFilesPrompt}
`
    }

    return result
  }

  private async buildCodeSnippetsPrompt(
    state: Partial<FsPluginState>
  ): Promise<string> {
    const {
      enableCodebaseAgent,
      codeSnippetFromAgent: codeSnippetFromCodebaseAgent
    } = state

    if (!enableCodebaseAgent || !codeSnippetFromCodebaseAgent?.length) return ''

    const mergedSnippets = await mergeCodeSnippets(codeSnippetFromCodebaseAgent)

    const snippetsContent = mergedSnippets
      .map(snippet =>
        formatCodeSnippet({
          relativePath: snippet.relativePath,
          code: snippet.code,
          startLine: snippet.startLine,
          endLine: snippet.endLine,
          showLine: true
        })
      )
      .join('')

    return snippetsContent
      ? `
## Potentially Relevant Code Snippets from the current Codebase

${snippetsContent}
${CONTENT_SEPARATOR}
`
      : ''
  }

  private buildCodeChunksPrompt(state: Partial<FsPluginState>): string {
    const { codeChunksFromEditor } = state

    if (!codeChunksFromEditor?.length) return ''

    const chunksContent = removeDuplicates(codeChunksFromEditor, [
      'relativePath',
      'code'
    ])
      .map(chunk =>
        formatCodeSnippet({
          relativePath: chunk.relativePath,
          code: chunk.code,
          language: chunk.language,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          showLine: Boolean(chunk.startLine && chunk.endLine)
        })
      )
      .join('')

    return chunksContent
  }

  private buildEditorErrorsPrompt(state: Partial<FsPluginState>): string {
    const { editorErrors } = state

    if (!editorErrors?.length) return ''

    // Group errors by file
    const errorsByFile = editorErrors.reduce(
      (acc, error) => {
        if (!acc[error.file]) {
          acc[error.file] = []
        }
        acc[error.file]!.push(error)
        return acc
      },
      {} as Record<string, EditorError[]>
    )

    // Format errors grouped by file
    const errorsContent = Object.entries(errorsByFile)
      .map(([file, errors]) => {
        const errorsList = errors
          .map(error => {
            const severity = error.severity.toUpperCase()
            const location = `${error.line}:${error.column}`
            const code = error.code ? `[${error.code}] ` : ''
            return `  - ${severity}: ${code}${error.message} (at line ${location})`
          })
          .join('\n')

        return `File: ${file}\n${errorsList}`
      })
      .join('\n\n')

    return `
## Current Editor Errors and Warnings

${errorsContent}
${CONTENT_SEPARATOR}
`
  }
}

const COMMON_SYSTEM_PROMPT = `
You are an intelligent programmer, powered by GPT-4. You are happy to help answer any questions that the user has (usually they will be about coding). You will be given the context of the code in their file(s) and potentially relevant blocks of code.

1. Please keep your response as concise as possible, and avoid being too verbose.

2. Do not lie or make up facts.

3. If a user messages you in a foreign language, please respond in that language.

4. Format your response in markdown.

5. When referencing code blocks in your answer, keep the following guidelines in mind:

  a. Never include line numbers in the output code.

  b. When outputting new code blocks, please specify the language ID after the initial backticks:
\`\`\`python
{{ code }}
\`\`\`

  c. When outputting code blocks for an existing file, include the file path after the initial backticks:
\`\`\`python:src/backend/main.py
{{ code }}
\`\`\`

  d. When referencing a code block the user gives you, only reference the start and end line numbers of the relevant code:
\`\`\`typescript:app/components/Todo.tsx
startLine: 2
endLine: 30
\`\`\`
`

const CHAT_WITH_FILE_SYSTEM_PROMPT = `
You are an intelligent programmer, powered by GPT-4o. You are happy to help answer any questions that the user has (usually they will be about coding).

1. Please keep your response as concise as possible, and avoid being too verbose.

2. When the user is asking for edits to their code, please output a simplified version of the code block that highlights the changes necessary and adds comments to indicate where unchanged code has been skipped. For example:
\`\`\`file_path
// ... existing code ...
{{ edit_1 }}
// ... existing code ...
{{ edit_2 }}
// ... existing code ...
\`\`\`
The user can see the entire file, so they prefer to only read the updates to the code. Often this will mean that the start/end of the file will be skipped, but that's okay! Rewrite the entire file only if specifically requested. Always provide a brief explanation of the updates, unless the user specifically requests only the code.

3. Do not lie or make up facts.

4. If a user messages you in a foreign language, please respond in that language.

5. Format your response in markdown.

6. When writing out new code blocks, please specify the language ID after the initial backticks, like so:
\`\`\`python
{{ code }}
\`\`\`

7. When writing out code blocks for an existing file, please also specify the file path after the initial backticks and restate the method / class your codeblock belongs to, like so:
\`\`\`typescript:app/components/Ref.tsx
AIChatHistory() {
    ...
    {{ code }}
    ...
}
\`\`\`
`

const FILE_CONTEXT_PROMPT = `
If you need to reference any of the code blocks I gave you, only output the start and end line numbers. For example:
\`\`\`typescript:app/components/Todo.tsx
startLine: 200
endLine: 310
\`\`\`

If you are writing code, do not include the "line_number|" before each line of code.
`

const CONTENT_SEPARATOR = `


-------



-------


`
