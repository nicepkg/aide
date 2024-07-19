import { getReferenceFilePaths } from '@/ai/get-reference-file-paths'
import {
  createModelProvider,
  getCurrentSessionIdHistoriesMap
} from '@/ai/helpers'
import { getFileOrFoldersPromptInfo } from '@/file-utils/get-fs-prompt-info'
import { insertTextAtSelection } from '@/file-utils/insert-text-at-selection'
import { streamingCompletionWriter } from '@/file-utils/stream-completion-writer'
import { getCurrentWorkspaceFolderEditor } from '@/utils'
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import type { RunnableConfig } from '@langchain/core/runnables'
import * as vscode from 'vscode'

const buildConvertPrompt = async ({
  workspaceFolder,
  currentFilePath,
  selection
}: {
  workspaceFolder: vscode.WorkspaceFolder
  currentFilePath: string
  selection: vscode.Selection
}): Promise<BaseLanguageModelInput> => {
  // content from clipboard
  const clipboardContent = await vscode.env.clipboard.readText()

  // current file content
  const locationMark = `### Here is the code you need to insert after convert ###`
  const currentFileContent = await insertTextAtSelection({
    filePath: currentFilePath,
    selection,
    textToInsert: locationMark
  })
  const currentFileRelativePath =
    vscode.workspace.asRelativePath(currentFilePath)

  // reference file content
  const { referenceFileRelativePaths, dependenceFileRelativePath } =
    await getReferenceFilePaths({ currentFilePath })
  const referencePaths = [
    ...new Set([dependenceFileRelativePath, ...referenceFileRelativePaths])
  ]
  const { promptFullContent: referenceFileContent } =
    await getFileOrFoldersPromptInfo(referencePaths, workspaceFolder.uri.fsPath)

  // console.log('smart-paste', {
  //   referencePaths,
  //   currentFileRelativePath,
  //   clipboardContent
  // })

  const prompt = `
  I will provide the content of the current file, as well as the content of several most useful files related to the currently edited file, to you.

  I would like you to automatically recognize the programming language of the current file's code and the code from the clipboard, then convert the code from the clipboard into the current file's programming language.

  The converted code should be inserted at the location marked with ${locationMark}.

  Please note that the converted code should be valid code without any syntax errors when I insert it into the location marked.

  **You should try to guess the my intention and the desired conversion style as much as possible.**

  For example, if I copied Tailwind CSS template code and pasted it into Flutter code, you should automatically recognize this as Tailwind CSS code and convert it to Flutter code.

  Another example if I copied Tailwind CSS template code and pasted it into vue style tag, you should automatically convert it as css/less/sass(which I use) code for me to insert into the style tag.

  Another example would be if I copied JSON data and pasted it into a TypeScript \`types XXX = {}\` statement, you should automatically recognize this as JSON data and convert it to a TypeScript type.

  **In short, you are always very smart to guess my intention based on the position where I paste, and then automatically convert the code.**

  You should not respond with anything other than the converted code.

  You should always use my mother tongue ${vscode.env.language} to add comments if the code requires comments.

  **Do not include any markdown syntax or wrap the code in a markdown code block.**

  Here are the details:

  1. Clipboard content:
  \`\`\`
  ${clipboardContent}
  \`\`\`

  2. Current file content:
  File: ${currentFileRelativePath}
  \`\`\`
  ${currentFileContent}
  \`\`\`

  3. Reference files content:
  ${referenceFileContent}

  **In short, you are always very smart to guess my intention based on the position where I paste, and then automatically convert the code.**
  Please convert the clipboard content to match the programming language and context of the current file, I will insert the converted code at the specified location.
  **Please do not reply with any text other than the code, and do not use markdown syntax**
  `

  return prompt
}

export const cleanupSmartPasteRunnables = async () => {
  const openDocumentPaths = new Set(
    vscode.workspace.textDocuments.map(doc => doc.uri.fsPath)
  )
  const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()

  Object.keys(sessionIdHistoriesMap).forEach(sessionId => {
    const path = sessionId.match(/^smartPaste:(.*)$/)?.[1]

    if (path && !openDocumentPaths.has(path)) {
      delete sessionIdHistoriesMap[sessionId]
    }
  })
}

export const handleSmartPaste = async () => {
  const { workspaceFolder, activeEditor } =
    await getCurrentWorkspaceFolderEditor()
  const currentFilePath = activeEditor.document.uri.fsPath

  // ai
  const modelProvider = await createModelProvider()
  const aiRunnableAbortController = new AbortController()
  const aiRunnable = await modelProvider.createRunnable({
    signal: aiRunnableAbortController.signal
  })
  const sessionId = `smartPaste:${currentFilePath}}`
  const aiRunnableConfig: RunnableConfig = {
    configurable: {
      sessionId
    }
  }
  const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()
  delete sessionIdHistoriesMap[sessionId]

  await streamingCompletionWriter({
    editor: activeEditor,
    onCancel() {
      aiRunnableAbortController.abort()
    },
    buildAiStream: async () => {
      const prompt = await buildConvertPrompt({
        workspaceFolder,
        currentFilePath,
        selection: activeEditor.selection
      })

      const aiStream = aiRunnable.stream(
        {
          input: prompt
        },
        aiRunnableConfig
      )

      return aiStream
    }
  })

  delete sessionIdHistoriesMap[sessionId]
}
