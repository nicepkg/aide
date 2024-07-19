import path from 'path'
import {
  createModelProvider,
  getCurrentSessionIdHistoriesMap
} from '@/ai/helpers'
import { t } from '@/i18n'
import { createLoading } from '@/loading'
import { getCurrentWorkspaceFolderEditor } from '@/utils'
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import type { RunnableConfig } from '@langchain/core/runnables'
import * as vscode from 'vscode'
import { z } from 'zod'

const buildRenameSuggestionPrompt = async ({
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

const renameSuggestionZodSchema = z.object({
  suggestionVariableNameOptions: z
    .array(
      z.object({
        variableName: z.string().describe('variable name'),
        description: z
          .string()
          .describe(
            `About this variable, describe its meaning in my mother tongue ${vscode.env.language}, within 15 words`
          )
      })
    )
    .describe('suggested variable names')
})

type RenameSuggestionZodSchema = z.infer<typeof renameSuggestionZodSchema>

const renameVariable = async ({
  newName,
  selection
}: {
  newName: string
  selection: vscode.Selection
}) => {
  const editor = vscode.window.activeTextEditor

  if (!editor) throw new Error(t('error.noActiveEditor'))

  const { document } = editor
  const position = selection.start

  // find all references
  const references = await vscode.commands.executeCommand<vscode.Location[]>(
    'vscode.executeReferenceProvider',
    document.uri,
    position
  )

  // create a workspace edit
  const edit = new vscode.WorkspaceEdit()

  if (references && references.length > 0) {
    // if references found, change all references
    references.forEach(reference => {
      edit.replace(reference.uri, reference.range, newName)
    })
  } else {
    // if no references found, only change the selected position
    edit.replace(
      document.uri,
      new vscode.Range(selection.start, selection.end),
      newName
    )
  }

  // apply the workspace edit
  await vscode.workspace.applyEdit(edit)
  await document.save()
}

export const handleRenameVariable = async () => {
  const { workspaceFolder, activeEditor } = getCurrentWorkspaceFolderEditor()
  const { selection } = activeEditor
  const variableName = activeEditor.document.getText(selection)
  const modelProvider = await createModelProvider()
  const { showProcessLoading, hideProcessLoading } = createLoading()

  const aiRunnable = await modelProvider.createStructuredOutputRunnable({
    zodSchema: renameSuggestionZodSchema
  })
  const sessionId = `renameVariable:${variableName}`
  const aiRunnableConfig: RunnableConfig = {
    configurable: {
      sessionId
    }
  }
  const sessionIdHistoriesMap = await getCurrentSessionIdHistoriesMap()

  // cleanup old session history
  delete sessionIdHistoriesMap[sessionId]

  let aiRes: any
  try {
    showProcessLoading()
    const prompt = await buildRenameSuggestionPrompt({
      contextCode: activeEditor.document.getText(),
      variableName,
      selection,
      fileRelativePath: path.relative(
        workspaceFolder?.uri.fsPath || '',
        activeEditor.document.uri.fsPath
      )
    })

    aiRes = await aiRunnable.invoke(
      {
        input: prompt
      },
      aiRunnableConfig
    )
  } finally {
    hideProcessLoading()
  }

  const suggestionVariableNameOptions = Array.from(
    aiRes?.suggestionVariableNameOptions || []
  ) as RenameSuggestionZodSchema['suggestionVariableNameOptions']

  if (suggestionVariableNameOptions.length > 0) {
    // show quick pick to select a new variable name
    const selectedVariableNameOption = await vscode.window.showQuickPick(
      suggestionVariableNameOptions.map(item => ({
        label: item.variableName,
        description: item.description
      })),
      {
        placeHolder: t('input.selectAiSuggestionsVariableName.prompt'),
        title: t('input.selectAiSuggestionsVariableName.prompt')
      }
    )

    if (selectedVariableNameOption) {
      await renameVariable({
        newName: selectedVariableNameOption.label,
        selection
      })
    }
  } else {
    // show info message if no suggestions
    vscode.window.showInformationMessage(t('info.noAiSuggestionsVariableName'))
  }

  delete sessionIdHistoriesMap[sessionId]
}
