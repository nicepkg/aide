import path from 'path'
import { traverseFileOrFolders } from '@extension/file-utils/traverse-fs'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { getWorkspaceFolder } from '@extension/utils'
import type {
  FileContext,
  FileInfo
} from '@extension/webview-api/chat-context-processor/types/chat-context'
import type { LangchainMessageContents } from '@extension/webview-api/chat-context-processor/types/langchain-message'
import { getLanguageId } from '@shared/utils/vscode-lang'

import type { ContextProcessor } from '../types/context-processor'

export class FileProcessor implements ContextProcessor<FileContext> {
  async buildMessageContents(
    attachment: FileContext
  ): Promise<LangchainMessageContents> {
    return await this.processFileContext(attachment)
  }

  private async processFileContext(
    fileContext: FileContext
  ): Promise<LangchainMessageContents> {
    const workspacePath = getWorkspaceFolder().uri.fsPath

    const processFolder = async (folder: string): Promise<string> => {
      const files = await traverseFileOrFolders({
        type: 'file',
        filesOrFolders: [folder],
        workspacePath,
        itemCallback: async (fileInfo: FileInfo) => {
          const { relativePath, fullPath } = fileInfo
          const languageId = getLanguageId(path.extname(relativePath).slice(1))
          const content = await VsCodeFS.readFileOrOpenDocumentContent(fullPath)
          return `\`\`\`${languageId}:${relativePath}\n${content}\n\`\`\`\n\n`
        }
      })
      return files.join('')
    }

    const processFile = async (file: FileInfo): Promise<string> => {
      const languageId = getLanguageId(path.extname(file.relativePath).slice(1))
      return `\`\`\`${languageId}:${file.relativePath}\n${file.content}\n\`\`\`\n\n`
    }

    const [folderContentsResults, fileContentsResults] = await Promise.all([
      Promise.allSettled(
        fileContext.selectedFolders.map(folder =>
          processFolder(folder.fullPath)
        )
      ),
      Promise.allSettled(fileContext.selectedFiles.map(processFile))
    ])

    let finalText = ``

    folderContentsResults.forEach(result => {
      if (result.status === 'fulfilled') {
        finalText += result.value
      }
    })

    fileContentsResults.forEach(result => {
      if (result.status === 'fulfilled') {
        finalText += result.value
      }
    })

    const messageContents: LangchainMessageContents = [
      {
        type: 'text',
        text: finalText
      }
    ]

    if (fileContext.selectedImages) {
      messageContents.push(
        ...fileContext.selectedImages.map(
          image =>
            ({
              type: 'image_url',
              image_url: image.url
            }) satisfies LangchainMessageContents[number]
        )
      )
    }

    return messageContents
  }
}
