import { CodebaseWatcherRegister } from '@extension/registers/codebase-watcher-register'
import { BaseAgent } from '@extension/webview-api/chat-context-processor/strategies/base/base-agent'
import type { BaseGraphState } from '@extension/webview-api/chat-context-processor/strategies/base/base-state'
import { settledPromiseResults } from '@shared/utils/common'
import { z } from 'zod'

import { mergeCodeSnippets } from '../fs-plugin/server/merge-code-snippets'
import type { CodeSnippet } from '../fs-plugin/types'
import { codebaseSearchAgentName } from './agent-names'

export class CodebaseSearchAgent extends BaseAgent<
  BaseGraphState,
  { enableCodebaseAgent: boolean }
> {
  static name = codebaseSearchAgentName

  name = CodebaseSearchAgent.name

  logTitle = 'Search Codebase'

  description = 'Search for relevant code in the codebase.'

  inputSchema = z.object({
    queryParts: z
      .array(z.string())
      .describe('List of search terms to find relevant code in the codebase')
  })

  outputSchema = z.object({
    codeSnippets: z.array(
      z.object({
        fileHash: z.string(),
        relativePath: z.string(),
        fullPath: z.string(),
        startLine: z.number(),
        startCharacter: z.number(),
        endLine: z.number(),
        endCharacter: z.number(),
        code: z.string()
      }) satisfies z.ZodType<CodeSnippet>
    )
  })

  async execute(input: z.infer<typeof this.inputSchema>) {
    const { enableCodebaseAgent } = this.context.createToolOptions

    if (!enableCodebaseAgent) {
      return { codeSnippets: [] }
    }

    const indexer = this.context.strategyOptions.registerManager.getRegister(
      CodebaseWatcherRegister
    )?.indexer

    if (!indexer) {
      return { codeSnippets: [] }
    }

    const searchResults = await settledPromiseResults(
      input.queryParts?.map(query => indexer.searchSimilarRow(query)) || []
    )

    const searchCodeSnippets = searchResults
      .flat()
      .slice(0, 8)
      .map(row => {
        // eslint-disable-next-line unused-imports/no-unused-vars
        const { embedding, ...others } = row
        return { ...others, code: '' }
      })

    const codeSnippets = await mergeCodeSnippets(searchCodeSnippets, {
      mode: 'expanded'
    })

    return { codeSnippets }
  }
}
