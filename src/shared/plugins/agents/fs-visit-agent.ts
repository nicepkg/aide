import { getValidFiles } from '@extension/file-utils/get-valid-files'
import type { FileInfo } from '@extension/file-utils/traverse-fs'
import { BaseAgent } from '@extension/webview-api/chat-context-processor/strategies/base/base-agent'
import type { BaseGraphState } from '@extension/webview-api/chat-context-processor/strategies/base/base-state'
import { z } from 'zod'

import { fsVisitAgentName } from './agent-names'

export class FsVisitAgent extends BaseAgent<BaseGraphState, {}> {
  static name = fsVisitAgentName

  name = FsVisitAgent.name

  logTitle = 'Visit Files'

  description = 'Access specific files in the workspace.'

  inputSchema = z.object({
    relativePaths: z
      .array(z.string())
      .describe(
        'An array of relative file paths to read from the workspace root'
      )
  })

  outputSchema = z.object({
    files: z.array(
      z.object({
        type: z.literal('file'),
        fullPath: z.string(),
        relativePath: z.string(),
        content: z.string()
      }) satisfies z.ZodType<FileInfo>
    )
  })

  async execute(input: z.infer<typeof this.inputSchema>) {
    const files = await getValidFiles(input.relativePaths, {
      isGetFileContent: false
    })
    return { files }
  }
}
