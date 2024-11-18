import { getReferenceFilePaths } from '@extension/ai/get-reference-file-paths'
import { getConfigKey } from '@extension/config'
import { getFileOrFoldersPromptInfo } from '@extension/file-utils/get-fs-prompt-info'
import { t } from '@extension/i18n'
import { createLoading } from '@extension/loading'
import { cacheFn } from '@extension/storage'
import { showQuickPickWithCustomInput } from '@extension/utils'
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import { FeatureModelSettingKey } from '@shared/entities'
import { AbortError } from '@shared/utils/common'
import { Minimatch, type MinimatchOptions } from 'minimatch'
import * as vscode from 'vscode'

import {
  getDefaultExpertCodeEnhancerPromptList,
  type ExpertCodeEnhancerPromptItem
} from './default-prompt-list'

const isMatched = (
  item: ExpertCodeEnhancerPromptItem,
  filePath: string
): boolean => {
  const minimatchOptions: MinimatchOptions = {
    dot: true,
    matchBase: true
  }
  const unixFilePath = filePath.replace(/\\/g, '/')

  if (typeof item.match === 'string') {
    return new Minimatch(item.match, minimatchOptions).match(unixFilePath)
  }

  if (Array.isArray(item.match)) {
    return item.match.some(pattern =>
      new Minimatch(pattern, minimatchOptions).match(unixFilePath)
    )
  }

  return false
}

// cache for 5 minutes
const cacheGetReferenceFilePaths = cacheFn(getReferenceFilePaths, 60 * 5)

export const buildGeneratePrompt = async ({
  workspaceFolder,
  currentFilePath,
  code,
  codeIsFromSelection,
  abortController
}: {
  workspaceFolder: vscode.WorkspaceFolder
  currentFilePath: string
  code: string
  codeIsFromSelection: boolean
  abortController?: AbortController
}): Promise<BaseLanguageModelInput> => {
  const expertCodeEnhancerPromptList = ((await getConfigKey(
    'expertCodeEnhancerPromptList'
  )) || []) as ExpertCodeEnhancerPromptItem[]

  const currentFileRelativePath =
    vscode.workspace.asRelativePath(currentFilePath)

  const currentFileFullContent = codeIsFromSelection

  const defaultPromptList = getDefaultExpertCodeEnhancerPromptList()

  const matchedPrompts = expertCodeEnhancerPromptList
    .concat(defaultPromptList)
    .map(item => {
      const title = item.title ? item.title : item.prompt.split('\n')[0]!
      const match = item.match ?? '**/*'

      return {
        ...item,
        title,
        match
      }
    })
    .filter(item => isMatched(item, currentFileRelativePath))
    .sort((a, b) => {
      const hasA = a.sort ?? false
      const hasB = b.sort ?? false
      if (hasA && hasB) return a.sort! - b.sort!
      if (!hasA && !hasB) return 0
      return hasA ? -1 : 1
    })

  const selected = await showQuickPickWithCustomInput({
    items: matchedPrompts.map(item => item.title) as string[],
    placeholder: t('input.expertCodeEnhancer.selectPrompt.title')
  })

  const selectedPrompt = selected
    ? matchedPrompts.find(item => item.title === selected) ||
      ({
        prompt: selected,
        title: 'Custom Prompt',
        match: '**/*',
        sort: 0
      } as ExpertCodeEnhancerPromptItem)
    : undefined

  if (!selectedPrompt) throw AbortError

  const customPrompt = selectedPrompt.prompt

  const baseInstructions = [
    '1. Focus solely on generating optimized code. Do not include any explanations, comments, or markdown formatting in your output.',
    `2. The language of your code comments should match the language used in the existing code comments. If there are no existing comments in the original code to reference, you should use ${vscode.env.language} language for your comments.`,
    '3. Always provide a complete and fully functional code solution. Do not omit or abbreviate any part of the code.',
    "4. Strictly adhere to the user's prompt and requirements specified below.",
    '5. Maintain the original functionality of the code while improving its efficiency, readability, or structure as requested.',
    '6. If the prompt asks for specific optimizations or changes, prioritize those requirements.',
    "7. Ensure that the optimized code is compatible with the original codebase and doesn't introduce new dependencies unless explicitly requested."
  ]

  const selectionInstructions = codeIsFromSelection
    ? [
        '8. The provided code is a selection from a larger file. Ensure your optimizations fit seamlessly into the larger context.'
      ]
    : []

  const contextInstructions = selectedPrompt.autoContext
    ? [
        '8. Use the provided context from related files to inform your optimization decisions. This may include understanding shared functions, data structures, or coding patterns used in the project.',
        '9. If the context reveals project-specific conventions or patterns, apply them consistently in your optimized code.',
        '10. Be cautious not to introduce conflicts with the existing codebase or break dependencies based on the provided context.'
      ]
    : []

  const allInstructions = [
    ...baseInstructions,
    ...selectionInstructions,
    ...contextInstructions
  ]

  let prompt = `
  You are an AI assistant specialized in code optimization and refactoring${selectedPrompt.autoContext ? ', with access to additional context from related files' : ''}. Your task is to analyze and improve the provided code based on the following instructions:

  **Important Instructions**:
  ${allInstructions.join('\n')}

  **Input Details**:
  `

  if (selectedPrompt.autoContext) {
    const { showProcessLoading, hideProcessLoading } = createLoading()

    showProcessLoading({
      onCancel() {
        abortController?.abort()
      }
    })

    const { referenceFileRelativePaths, dependenceFileRelativePath } =
      await cacheGetReferenceFilePaths({
        featureModelSettingKey: FeatureModelSettingKey.ExpertCodeEnhancer,
        currentFilePath,
        abortController
      })

    const referencePaths = [
      ...new Set([dependenceFileRelativePath, ...referenceFileRelativePaths])
    ]
    const { promptFullContent: referenceFileContent } =
      await getFileOrFoldersPromptInfo(
        referencePaths,
        workspaceFolder.uri.fsPath
      )

    hideProcessLoading()

    prompt += `
  0. Reference Files:
  ${referenceFileContent}
    `
  }

  prompt += `
  ${
    codeIsFromSelection
      ? `
  1. Current File, the code to be optimized is a selection from this file.:
  File: ${currentFileRelativePath}
  \`\`\`
  ${currentFileFullContent}
  \`\`\`
  `
      : ''
  }

  2. Here's the code you need to optimize:
  ${code}

  **Important! User's prompt**:
  ${customPrompt}

  **Final Reminder**:
  The language of your code comments should match the language used in the existing code comments. If there are no existing comments in the original code to reference, you should use ${vscode.env.language} language for your comments.
  Please provide the optimized code based on these instructions${selectedPrompt.autoContext ? ", the user's prompt, and the given context" : " and the user's prompt"}.
  Please do not reply with any text other than the code or code comments, and do not use markdown syntax.
  `

  return prompt
}
