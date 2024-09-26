import {
  traverseFileOrFolders,
  type FileInfo
} from '@extension/file-utils/traverse-fs'
import { logger } from '@extension/logger'
import { getWorkspaceFolder } from '@extension/utils'
import type {
  Conversation,
  GitDiff
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type {
  LangchainMessage,
  LangchainMessageContents
} from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { formatCodeSnippet } from '@extension/webview-api/chat-context-processor/utils/code-snippet-formatter'
import { getFileContent } from '@extension/webview-api/chat-context-processor/utils/get-file-content'
import { mergeCodeSnippets } from '@extension/webview-api/chat-context-processor/utils/merge-code-snippets'
import { MessageBuilder } from '@extension/webview-api/chat-context-processor/utils/message-builder'
import { HumanMessage } from '@langchain/core/messages'

import { CONTENT_SEPARATOR, FILE_CONTEXT_PROMPT } from './constants'

interface BuildFilePromptsResult {
  selectedFilesPrompt: string
  currentFilesPrompt: string
}

export class ConversationMessageConstructor {
  private conversation: Conversation

  private hasAttachedFiles: boolean

  private _buildFilePromptsResult!: BuildFilePromptsResult

  private async getBuildFilePromptsResult(): Promise<BuildFilePromptsResult> {
    if (!this._buildFilePromptsResult) {
      this._buildFilePromptsResult = await this.buildFilePrompts()
    }

    return this._buildFilePromptsResult
  }

  constructor(conversation: Conversation, hasAttachedFiles: boolean) {
    this.conversation = conversation
    this.hasAttachedFiles = hasAttachedFiles
  }

  async buildMessages(): Promise<LangchainMessage[]> {
    if (this.conversation.role !== 'human') {
      return [
        MessageBuilder.createMessage(
          this.conversation.role,
          this.conversation.contents
        )
      ].filter(Boolean) as LangchainMessage[]
    }

    const contextMessage = await this.buildContextMessage()
    const userMessage = await this.buildUserMessage()

    return [contextMessage, userMessage].filter(Boolean) as LangchainMessage[]
  }

  private async buildContextMessage(): Promise<HumanMessage | null> {
    const codeSnippetsPrompt = await this.buildCodeSnippetsPrompt()

    logger.dev.verbose('codeSnippetsPrompt', codeSnippetsPrompt)

    const { currentFilesPrompt } = await this.getBuildFilePromptsResult()
    const relevantDocsPrompt = this.buildRelevantDocsPrompt()
    const gitCommitsPrompt = this.buildGitCommitPrompt()

    const _gitDiffsPrompt = this.buildGitDiffsPrompt()
    const gitDiffsPrompt = _gitDiffsPrompt
      ? `# Git Diffs\n\n${_gitDiffsPrompt}`
      : ''

    const prompts = [
      codeSnippetsPrompt,
      currentFilesPrompt,
      relevantDocsPrompt,
      gitCommitsPrompt,
      gitDiffsPrompt
    ].filter(Boolean)

    if (!prompts.length) {
      return null
    }

    return new HumanMessage({
      content: `
# Inputs

${prompts.join('\n\n')}
`
    })
  }

  private async buildUserMessage(): Promise<HumanMessage> {
    const { selectedFilesPrompt } = await this.getBuildFilePromptsResult()
    const codeChunksPrompt = this.buildCodeChunksPrompt()
    const fileContextPrompt = this.hasAttachedFiles ? FILE_CONTEXT_PROMPT : ''

    const imageContents: LangchainMessageContents =
      this.conversation.attachments?.fileContext.selectedImages.map(image => ({
        type: 'image_url',
        image_url: image.url
      })) || []

    let isEnhanced = false
    const enhancedContents: LangchainMessageContents =
      this.conversation.contents
        .map(content => {
          if (content.type === 'text' && !isEnhanced) {
            isEnhanced = true
            return {
              ...content,
              text: `
${selectedFilesPrompt}
${codeChunksPrompt}
${content.text}
${fileContextPrompt}
`
            }
          }
          return content
        })
        .concat(...imageContents)

    return new HumanMessage({ content: enhancedContents })
  }

  private async buildCodeSnippetsPrompt(): Promise<string> {
    const codeSnippets =
      this.conversation.attachments?.codebaseContext.relevantCodeSnippets

    if (!codeSnippets || codeSnippets.length === 0) return ''

    const mergedSnippets = await mergeCodeSnippets(codeSnippets)

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

  private async buildFilePrompts(): Promise<BuildFilePromptsResult> {
    const fileContext = this.conversation.attachments?.fileContext
    const result = { selectedFilesPrompt: '', currentFilesPrompt: '' }

    if (!fileContext) return result

    const workspacePath = getWorkspaceFolder().uri.fsPath
    const currentFilePaths = new Set(
      fileContext.currentFiles.map(file => file.fullPath)
    )
    const processedFiles = new Set<string>()

    await traverseFileOrFolders({
      type: 'file',
      filesOrFolders: [
        ...fileContext.selectedFolders.map(folder => folder.fullPath),
        ...fileContext.selectedFiles.map(file => file.fullPath)
      ],
      workspacePath,
      itemCallback: async (fileInfo: FileInfo) => {
        if (processedFiles.has(fileInfo.fullPath)) return

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

        processedFiles.add(fileInfo.fullPath)
      }
    })

    if (result.currentFilesPrompt) {
      result.currentFilesPrompt = `
## Current Files
Here is the file I'm looking at. It might be truncated from above and below and, if so, is centered around my cursor.

${result.currentFilesPrompt}
`
    }

    return result
  }

  private buildCodeChunksPrompt(): string {
    const codeChunks = this.conversation.attachments?.codeContext.codeChunks
    if (!codeChunks || codeChunks.length === 0) return ''

    const chunksContent = codeChunks
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

  private buildRelevantDocsPrompt(): string {
    const relevantDocs = this.conversation.attachments?.docContext.relevantDocs
    if (!relevantDocs || relevantDocs.length === 0) return ''

    let docsContent = ''

    relevantDocs.forEach(doc => {
      docsContent += `
Source Path: ${doc.path}
Content: ${doc.content}
`
    })

    return docsContent
      ? `
## Potentially Relevant Docs

${docsContent}
${CONTENT_SEPARATOR}
`
      : ''
  }

  private buildGitDiffsPrompt(
    gitDiffs: GitDiff[] | undefined = this.conversation.attachments?.gitContext
      .gitDiffs
  ): string {
    if (!gitDiffs?.length) return ''

    let gitDiffContent = ''

    gitDiffs.forEach(diff => {
      gitDiffContent += `
File: ${diff.from} → ${diff.to}
Changes:
${diff.chunks
  .map(chunk => chunk.content + chunk.lines.map(line => line).join('\n'))
  .join('\n')}
`
    })

    return gitDiffContent
  }

  private buildGitCommitPrompt(): string {
    const gitCommits = this.conversation.attachments?.gitContext.gitCommits
    if (!gitCommits?.length) return ''

    let gitCommitContent = `
## Git Commits
  `

    gitCommits.forEach(commit => {
      gitCommitContent += `
Commit: ${commit.sha}
Message: ${commit.message}
Author: ${commit.author}
Date: ${commit.date}
Diffs:
${this.buildGitDiffsPrompt(commit.diff)}
`
    })

    return gitCommitContent
  }
}
