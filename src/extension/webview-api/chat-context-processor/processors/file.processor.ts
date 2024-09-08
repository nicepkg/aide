import path from 'path'
import { traverseFileOrFolders } from '@extension/file-utils/traverse-fs'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { getLanguageId, getWorkspaceFolder } from '@extension/utils'
import type { MessageContentComplex } from '@langchain/core/messages'

import type { FileContext, FileInfo } from '../types/chat-context/file-context'
import type { ContextProcessor } from '../types/context-processor'
import type { LangchainMessageParams } from '../types/langchain-message'

export class FileProcessor implements ContextProcessor<FileContext> {
  async buildMessageParams(
    attachment: FileContext
  ): Promise<LangchainMessageParams> {
    return await this.processFileContext(attachment)
  }

  private async processFileContext(
    fileContext: FileContext
  ): Promise<LangchainMessageParams> {
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

    const [folderContents, fileContents] = await Promise.all([
      Promise.allSettled(
        fileContext.selectedFolders.map(folder =>
          processFolder(folder.fullPath)
        )
      ),
      Promise.allSettled(fileContext.selectedFiles.map(processFile))
    ])

    const messageParams = {
      content: [
        {
          type: 'text',
          text: [...folderContents, ...fileContents].join('')
        }
      ] as MessageContentComplex[]
    } satisfies LangchainMessageParams

    if (fileContext.selectedImages) {
      messageParams.content.push(
        ...fileContext.selectedImages.map(image => ({
          type: 'image_url',
          image_url: image.url
        }))
      )
    }

    return messageParams
  }
}
