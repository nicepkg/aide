import { getReferenceFilePaths } from '@/ai/get-reference-file-paths'
import { safeReadClipboard } from '@/clipboard'
import { getConfigKey } from '@/config'
import { getFileOrFoldersPromptInfo } from '@/file-utils/get-fs-prompt-info'
import { insertTextAtSelection } from '@/file-utils/insert-text-at-selection'
import { t } from '@/i18n'
import { cacheFn } from '@/storage'
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

export const buildConvertChatMessages = async ({
  workspaceFolder,
  currentFilePath,
  selection,
  abortController
}: {
  workspaceFolder: vscode.WorkspaceFolder
  currentFilePath: string
  selection: vscode.Selection
  abortController?: AbortController
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
    await cacheGetReferenceFilePaths({ currentFilePath, abortController })
  const referencePaths = [
    ...new Set([dependenceFileRelativePath, ...referenceFileRelativePaths])
  ]
  const { promptFullContent: referenceFileContent } =
    await getFileOrFoldersPromptInfo(referencePaths, workspaceFolder.uri.fsPath)

  // build clipboard content prompt
  const clipboardContentPrompt = clipboardImg
    ? `
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

**Guidelines for UI Conversion**:
- Match colors, sizes, text, and layout exactly as in the image.
- Extract page text and data into variables for easy maintenance.
- Split UI components to make the code modular and maintainable.
- Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
- Make sure to always get the layout right (if things are arranged in a row in the screenshot, they should be in a row in the app as well)
- **For images, use placeholder images from \`https://placehold.co\`** and include a detailed description of the image in the alt text so that an image generation AI can generate the image later.

**Guidelines for UI Code Generate:**
- **Modular Design**: Break down the UI into small, reusable components. Each component should focus on a single responsibility.
- **Avoid Hardcoding**: Do not hard-code any UI data. Instead, use variables or props to pass data into components. This makes the components reusable and the code more maintainable.
- **Data and State Management**: Extract page text, styles, and data into variables, constants, or state as appropriate. Ensure that data is not embedded directly in the UI code.
- **Use Props and State**: Design components to accept props for data and configuration, allowing them to be reused in different contexts.
- **Maintainable and Readable Code**: Write clear, concise, and well-commented code. Ensure that the code is easy to understand and modify in the future.
  `
    : `
  \`\`\`
  ${clipboardContent}
  \`\`\`
`

  // some prompt comes from https://github.com/abi/screenshot-to-code/blob/main/backend/prompts/claude_prompts.py
  const prompt = `
I'm providing the content of the current file and the content of several related files. Your task is to recognize the programming language of the current file and the content from the clipboard, then convert the clipboard content into the programming language and context of the current file.

**Important Instructions**:
1. **Language Detection & Conversion**:
   - Detect the language of the current file and the clipboard content.
   - Convert the clipboard content into the appropriate language and style for the current file's context.

2. **Code Integration**:
   - The converted code should be valid and without syntax errors.
   - Insert the converted code at the marked location: ${locationMark}.

3. **Understanding Intent**:
   - Understand the likely intent behind the pasted content and match the desired conversion style.

**Examples**:
- **Tailwind CSS to Flutter**: Convert Tailwind CSS code to Flutter code when pasted into Flutter files.
- **JSON to TypeScript**: Convert JSON data to a TypeScript type when pasted into a TypeScript file.
- **Image to JSX/Vue/Other GUI**: Convert UI elements from an image into JSX/Vue/Other GUI code, maintaining the style and layout accurately. Use placeholder images and include detailed alt text descriptions.

**General Rules**:
- Be smart in guessing the intended usage based on the paste location.
- Use ${vscode.env.language} for comments if needed.
- **Only provide the converted code without any markdown syntax or additional text.**

**Input Details**:
1. Clipboard Content:
${clipboardContentPrompt}

2. Current File:
File: ${currentFileRelativePath}
\`\`\`
${currentFileContent}
\`\`\`

3. Reference Files:
${referenceFileContent}

**Final Reminder**:
Convert the clipboard content to match the programming language and context of the current file. **Only provide the converted code.**
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
