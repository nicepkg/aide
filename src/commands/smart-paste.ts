import { getReferenceFilePaths } from '@/ai/get-reference-file-paths'
import {
  createModelProvider,
  getCurrentSessionIdHistoriesMap
} from '@/ai/helpers'
import { safeReadClipboard } from '@/clipboard'
import { getConfigKey } from '@/config'
import { getFileOrFoldersPromptInfo } from '@/file-utils/get-fs-prompt-info'
import { insertTextAtSelection } from '@/file-utils/insert-text-at-selection'
import { streamingCompletionWriter } from '@/file-utils/stream-completion-writer'
import { t } from '@/i18n'
import { cacheFn } from '@/storage'
import { getCurrentWorkspaceFolderEditor } from '@/utils'
import { HumanMessage, type BaseMessage } from '@langchain/core/messages'
import * as vscode from 'vscode'

// cache for 5 minutes
const cacheGetReferenceFilePaths = cacheFn(getReferenceFilePaths, 60 * 5)

const getClipboardContent = async () => {
  const readClipboardImage = await getConfigKey('readClipboardImage')
  const { img: clipboardImg, text: clipboardContent } = await safeReadClipboard(
    { readImg: readClipboardImage }
  )

  // nothing to paste
  if (!clipboardImg && !clipboardContent) {
    throw new Error(t('error.emptyClipboard'))
  }
  return { clipboardImg, clipboardContent }
}

const buildConvertChatMessages = async ({
  workspaceFolder,
  currentFilePath,
  selection
}: {
  workspaceFolder: vscode.WorkspaceFolder
  currentFilePath: string
  selection: vscode.Selection
}): Promise<BaseMessage[]> => {
  const { clipboardImg, clipboardContent } = await getClipboardContent()

  // console.log('smart-paste', { img: clipboardImg?.slice(0, 100) })

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
    await cacheGetReferenceFilePaths({ currentFilePath })
  const referencePaths = [
    ...new Set([dependenceFileRelativePath, ...referenceFileRelativePaths])
  ]
  const { promptFullContent: referenceFileContent } =
    await getFileOrFoldersPromptInfo(referencePaths, workspaceFolder.uri.fsPath)

  // build clipboard content prompt
  const clipboardContentPrompt = clipboardImg
    ? `
  1. Clipboard content:
  ${
    clipboardContent
      ? `
  \`\`\`
  ${clipboardContent}
  \`\`\`
  `
      : 'No Clipboard Content'
  }

  BTW, I copied an image, please automatically recognize and convert it into code based on the image content.
  `
    : `
  1. Clipboard content:
  \`\`\`
  ${clipboardContent}
  \`\`\`
`
  // some prompt comes from https://github.com/abi/screenshot-to-code/blob/main/backend/prompts/claude_prompts.py
  // thanks to the author
  const prompt = `
  I will provide the content of the current file, as well as the content of several most useful files related to the currently edited file, to you.

  I would like you to automatically recognize the programming language of the current file's code and the code from the clipboard, then convert the code from the clipboard into the current file's programming language.

  The converted code should be inserted at the location marked with ${locationMark}.

  Please note that the converted code should be valid code without any syntax errors when I insert it into the location marked.

  **You should try to guess the my intention and the desired conversion style as much as possible.**

  Example 1:
    - If I copied Tailwind CSS template code and pasted it into Flutter code, you should automatically recognize this as Tailwind CSS code and convert it to Flutter code.

  Example 2:
    - If I copied Tailwind CSS template code and pasted it into vue style tag, you should automatically convert it as css/less/sass(which I use) code for me to insert into the style tag.

  Example 3:
    - If I copied JSON data and pasted it into a TypeScript \`types XXX = {}\` statement, you should automatically recognize this as JSON data and convert it to a TypeScript type.

  Example 4:
    - If I copied an image and pasted it into a jsx/vue template,
      you should read the ui elements in the image and automatically convert them to the corresponding jsx/vue code,
      the class name style should be consistent with the current file, and you also need follow the following rules:
        - Make sure the app looks exactly like the screenshot.
        - Do not leave out smaller UI elements. Make sure to include every single thing in the screenshot.
        - Pay close attention to background color, text color, font size, font family, padding, margin, border, etc. Match the colors and sizes exactly.
        - In particular, pay attention to background color and overall color scheme.
        - Use the exact text from the screenshot.
        - Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
        - Make sure to always get the layout right (if things are arranged in a row in the screenshot, they should be in a row in the app as well)
        - **For images, use placeholder images from \`https://placehold.co\`** and include a detailed description of the image in the alt text so that an image generation AI can generate the image later.


  Important:
    - **In short, you are always very smart to guess my intention based on the position where I paste, and then automatically convert the code.**

  If there is no text content in the clipboard, I will tell you \`No Clipboard Content.\`

  You should not respond with anything other than the converted code.

  You should always use my mother tongue ${vscode.env.language} to add comments if the code requires comments.

  **Do not include any markdown syntax or wrap the code in a markdown code block.**

  Here are the details:

  ${clipboardContentPrompt}

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

  const messages: BaseMessage[] = []

  if (!clipboardImg) {
    // only clipboard text
    messages.push(new HumanMessage({ content: prompt }))
  } else {
    // clipboard image
    messages.push(
      new HumanMessage({
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: clipboardImg
            }
          }
        ]
      })
    )
  }

  return messages
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
  const aiModelAbortController = new AbortController()
  const aiModel = (await modelProvider.getModel()).bind({
    signal: aiModelAbortController.signal
  })

  const sessionId = `smartPaste:${currentFilePath}}`
  const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()

  // TODO: remove and support continue generate in the future
  delete sessionIdHistoriesMap[sessionId]

  await streamingCompletionWriter({
    editor: activeEditor,
    onCancel() {
      aiModelAbortController.abort()
    },
    buildAiStream: async () => {
      const convertMessages = await buildConvertChatMessages({
        workspaceFolder,
        currentFilePath,
        selection: activeEditor.selection
      })

      const history = await modelProvider.getHistory(sessionId)
      const historyMessages = await history.getMessages()
      const currentMessages: BaseMessage[] = convertMessages
      const aiStream = aiModel.stream([...historyMessages, ...currentMessages])
      history.addMessages(currentMessages)

      return aiStream
    }
  })

  // TODO: remove and support continue generate in the future
  delete sessionIdHistoriesMap[sessionId]
}
