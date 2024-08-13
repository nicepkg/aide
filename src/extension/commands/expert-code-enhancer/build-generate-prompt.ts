import { getReferenceFilePaths } from '@extension/ai/get-reference-file-paths'
import { getConfigKey } from '@extension/config'
import { AbortError } from '@extension/constants'
import { getFileOrFoldersPromptInfo } from '@extension/file-utils/get-fs-prompt-info'
import { t, translateVscodeJsonText } from '@extension/i18n'
import { cacheFn } from '@extension/storage'
import { showQuickPickWithCustomInput } from '@extension/utils'
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import { Minimatch, type MinimatchOptions } from 'minimatch'
import * as vscode from 'vscode'

interface ExpertCodeEnhancerPromptItem {
  match?: string | string[]
  title?: string
  prompt: string
  sort?: number
  autoContext?: boolean // need function_call, default is false
}

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

  const matchedPrompts = expertCodeEnhancerPromptList
    .map(item => {
      const title = item.title
        ? translateVscodeJsonText(item.title)
        : item.prompt.split('\n')[0]!
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
    '2. Always provide a complete and fully functional code solution. Do not omit or abbreviate any part of the code.',
    "3. Strictly adhere to the user's prompt and requirements specified below.",
    '4. Maintain the original functionality of the code while improving its efficiency, readability, or structure as requested.',
    '5. If the prompt asks for specific optimizations or changes, prioritize those requirements.',
    "6. Ensure that the optimized code is compatible with the original codebase and doesn't introduce new dependencies unless explicitly requested."
  ]

  const selectionInstructions = codeIsFromSelection
    ? [
        '7. The provided code is a selection from a larger file. Ensure your optimizations fit seamlessly into the larger context.'
      ]
    : []

  const contextInstructions = selectedPrompt.autoContext
    ? [
        '7. Use the provided context from related files to inform your optimization decisions. This may include understanding shared functions, data structures, or coding patterns used in the project.',
        '8. If the context reveals project-specific conventions or patterns, apply them consistently in your optimized code.',
        '9. Be cautious not to introduce conflicts with the existing codebase or break dependencies based on the provided context.'
      ]
    : []

  const allInstructions = [
    ...baseInstructions,
    ...selectionInstructions,
    ...contextInstructions
  ]

  let prompt = `
  You are an AI assistant specialized in code optimization and refactoring${selectedPrompt.autoContext ? ', with access to additional context from related files' : ''}. Your task is to analyze and improve the provided code based on the following instructions:

  ${allInstructions.join('\n')}

  Here's the user's prompt:
  ${customPrompt}

  Here's the code you need to optimize:
  ${code}

  ${
    codeIsFromSelection
      ? `
  Full file content:
  ${currentFileFullContent}

  File path: ${currentFileRelativePath}

  The code to be optimized is a selection from the above file.
  `
      : ''
  }
  `

  if (selectedPrompt.autoContext) {
    const { referenceFileRelativePaths, dependenceFileRelativePath } =
      await cacheGetReferenceFilePaths({ currentFilePath, abortController })

    const referencePaths = [
      ...new Set([dependenceFileRelativePath, ...referenceFileRelativePaths])
    ]
    const { promptFullContent: referenceFileContent } =
      await getFileOrFoldersPromptInfo(
        referencePaths,
        workspaceFolder.uri.fsPath
      )

    prompt += `
    Context from related files:
    ${referenceFileContent}
    `
  }

  prompt += `
  Please provide the optimized code based on these instructions${selectedPrompt.autoContext ? ", the user's prompt, and the given context" : " and the user's prompt"}.
  Please do not reply with any text other than the code, and do not use markdown syntax.
  `

  return prompt
}
