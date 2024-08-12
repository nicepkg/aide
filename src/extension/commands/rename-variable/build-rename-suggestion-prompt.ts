import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import * as vscode from 'vscode'

export const buildRenameSuggestionPrompt = async ({
  contextCode,
  variableName,
  selection,
  fileRelativePath
}: {
  contextCode: string
  variableName: string
  selection: vscode.Selection
  fileRelativePath: string
}): Promise<BaseLanguageModelInput> => {
  const lines = contextCode.split('\n')

  // get the line index where the selected variable is located
  const activeLine = selection.start.line

  // calculate the range of 250 lines before and after
  const start = Math.max(0, activeLine - 250)
  const end = Math.min(lines.length, activeLine + 250)

  // get the content of 250 lines before and after
  const contextLines = lines.slice(start, end)

  // add a comment line above the line where the variable is located
  contextLines.splice(
    activeLine - start,
    0,
    `### Here is the variable you want to change: ${variableName} ###`
  )

  const codeContextForPrompt = contextLines.join('\n')

  const prompt = `
  Please refer to the following code snippet to change the variable name \`${variableName}\` to a more reasonable name.
  Give a few suggestions for a more reasonable name.
  **You should always follow the naming conventions of the current code snippet to generate new variable names.**
  current file relative path: ${fileRelativePath}
  Here is the code snippet:

  ${codeContextForPrompt}
  `

  return prompt
}
