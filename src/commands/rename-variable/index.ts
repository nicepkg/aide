import path from 'path'
import {
  createModelProvider,
  getCurrentSessionIdHistoriesMap
} from '@/ai/helpers'
import { AbortError } from '@/constants'
import { t } from '@/i18n'
import { createLoading } from '@/loading'
import { getCurrentWorkspaceFolderEditor } from '@/utils'
import type { RunnableConfig } from '@langchain/core/runnables'
import * as vscode from 'vscode'
import { z } from 'zod'

import { buildRenameSuggestionPrompt } from './build-rename-suggestion-prompt'
import { submitRenameVariable } from './submit-rename-variable'

const renameSuggestionZodSchema = z.object({
  suggestionVariableNameOptions: z
    .array(
      z.object({
        variableName: z.string().describe('Required! variable name'),
        description: z
          .string()
          .describe(
            `Required! About this variable, describe its meaning in my mother tongue ${vscode.env.language}, within 15 words`
          )
      })
    )
    .describe('Required! suggested variable names list')
})

type RenameSuggestionZodSchema = z.infer<typeof renameSuggestionZodSchema>

export const handleRenameVariable = async () => {
  const { workspaceFolder, activeEditor } = getCurrentWorkspaceFolderEditor()
  const { selection } = activeEditor
  const variableName = activeEditor.document.getText(selection)
  const modelProvider = await createModelProvider()
  const { showProcessLoading, hideProcessLoading } = createLoading()

  const abortController = new AbortController()
  const aiRunnable = await modelProvider.createStructuredOutputRunnable({
    signal: abortController.signal,
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
    showProcessLoading({
      onCancel: () => {
        abortController.abort()
      }
    })
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

  if (abortController?.signal.aborted) throw AbortError

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
      await submitRenameVariable({
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
