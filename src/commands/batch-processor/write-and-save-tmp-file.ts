import path from 'path'
import { createModelProvider } from '@/ai/helpers'
import { AbortError } from '@/constants'
import { getTmpFileUri } from '@/file-utils/create-tmp-file'
import { tmpFileWriter } from '@/file-utils/tmp-file-writer'
import { VsCodeFS } from '@/file-utils/vscode-fs'
import { logger } from '@/logger'
import { getLanguageId } from '@/utils'
import { HumanMessage } from '@langchain/core/messages'
import * as vscode from 'vscode'

export const writeAndSaveTmpFile = async ({
  prompt,
  workspacePath,
  allFileRelativePaths,
  sourceFileRelativePath,
  processedFileRelativePath,
  dependenceFileRelativePath,
  abortController
}: {
  prompt: string
  workspacePath: string
  allFileRelativePaths: string[]
  sourceFileRelativePath: string
  processedFileRelativePath: string
  dependenceFileRelativePath: string | undefined
  abortController?: AbortController
}) => {
  logger.log(`writeAndSaveTmpFile...: ${sourceFileRelativePath}`)
  // ai
  const modelProvider = await createModelProvider()
  const aiModel = (await modelProvider.getModel()).bind({
    signal: abortController?.signal
  })

  if (abortController?.signal.aborted) throw AbortError

  const getContentFromRelativePath = async (relativePath: string) => {
    if (!relativePath) return ''
    const fileFullPath = path.join(workspacePath, relativePath)
    const content = await VsCodeFS.readFile(fileFullPath, 'utf8')
    return content
  }

  const getProcessedFileUri = async () => {
    const processedFileExt = path.extname(processedFileRelativePath).slice(1)
    const processedLanguageId = getLanguageId(processedFileExt)
    const sourceFileFullPath = path.join(workspacePath, sourceFileRelativePath)
    const aideFileUri = getTmpFileUri({
      originalFileFullPath: sourceFileFullPath,
      languageId: processedLanguageId,
      untitled: false
    })

    await VsCodeFS.writeFile(aideFileUri.fsPath, '', 'utf8')

    return aideFileUri
  }

  const locale = vscode.env.language
  const processedFileUri = await getProcessedFileUri()
  const sourceFileContent = await getContentFromRelativePath(
    sourceFileRelativePath
  )
  const dependenceFileContent = await getContentFromRelativePath(
    dependenceFileRelativePath || ''
  )

  if (abortController?.signal.aborted) throw AbortError

  await tmpFileWriter({
    stopWriteWhenClosed: true,
    enableProcessLoading: false,
    autoSaveWhenDone: true,
    autoCloseWhenDone: true,
    tmpFileUri: processedFileUri,
    onCancel() {
      abortController?.abort()
    },
    buildAiStream: async () => {
      const aiStream = aiModel.stream([
        new HumanMessage({
          content: `
You are an expert programmer and code analyzer. Your task is to process the given source file according to the user's specific requirements. This may include, but is not limited to, converting code to a new format or framework, adding detailed comments, optimizing code, refactoring, or any other code-related task. Please follow these instructions:

1. Context:
   - All file paths in the project: ${allFileRelativePaths.join(', ')}
   - Source file path: ${sourceFileRelativePath}
   - Processed file path: ${processedFileRelativePath}
   - Dependency file path: ${dependenceFileRelativePath || 'Not provided'}

2. Source content:
\`\`\`
${sourceFileContent}
\`\`\`

3. Dependency file content (if available):
\`\`\`
${dependenceFileContent}
\`\`\`

4. IMPORTANT! User's requirements:
${prompt}

5. Processing task:
   - Carefully analyze the source file content and the user's requirements.
   - Perform the requested task, which could be any of the following or a combination:
     * Converting the code to a different format or framework
     * Adding detailed code comments
     * Optimizing the code for better performance or readability
     * Refactoring the code
     * Implementing new features or modifying existing ones
     * Any other code-related task specified by the user
   - User's native language is ${locale}, please consider this when adding comments or documentation.
   - Ensure that your changes align with the user's requirements and the overall project structure.
   - Unless explicitly requested otherwise, maintain the original code's structure and naming conventions as much as possible.

6. Output:
   - Provide the processed code that should be written to the processed file.
   - The output should contain only the processed code, including any new comments if that was part of the task.
   - Do not include any explanations or meta-comments outside of the code itself.

7. Important notes:
   - Pay close attention to the user's specific requirements and tailor your response accordingly.
   - If the task involves significant changes, ensure that the core functionality of the code is preserved unless explicitly instructed otherwise.
   - Be mindful of the project's overall structure and any dependencies when making changes.
   - If certain parts of the task are unclear or seem contradictory, interpret them in a way that seems most beneficial to the project and consistent with good coding practices.
   - If the task involves adding comments or documentation, ensure they are clear, concise, and genuinely helpful for understanding the code.

Please proceed with the requested task and output the resulting code.
Please do not reply with any text other than the code, and do not use markdown syntax.
              `
        })
      ])
      return aiStream
    }
  })

  logger.log(`writeAndSaveTmpFile done: ${sourceFileRelativePath}`)
}
