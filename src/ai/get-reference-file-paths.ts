import { AbortError } from '@/constants'
import { traverseFileOrFolders } from '@/file-utils/traverse-fs'
import { getCurrentWorkspaceFolderEditor, toPlatformPath } from '@/utils'
import * as vscode from 'vscode'
import { z } from 'zod'

import { createModelProvider } from './helpers'

export interface ReferenceFilePaths {
  referenceFileRelativePaths: string[]
  dependenceFileRelativePath: string
}

export const getReferenceFilePaths = async ({
  currentFilePath,
  abortController
}: {
  currentFilePath: string
  abortController?: AbortController
}): Promise<ReferenceFilePaths> => {
  const { workspaceFolder } = await getCurrentWorkspaceFolderEditor()
  const allRelativePaths: string[] = []

  await traverseFileOrFolders(
    [workspaceFolder.uri.fsPath],
    workspaceFolder.uri.fsPath,
    fileInfo => {
      allRelativePaths.push(fileInfo.relativePath)
    }
  )

  const currentFileRelativePath =
    vscode.workspace.asRelativePath(currentFilePath)

  const modelProvider = await createModelProvider()
  const aiRunnable = await modelProvider.createStructuredOutputRunnable({
    signal: abortController?.signal,
    useHistory: false,
    zodSchema: z.object({
      referenceFileRelativePaths: z.array(z.string()).min(0).max(3).describe(`
        Required! The relative paths array of the up to three most useful files related to the currently edited file. This can include 0 to 3 files.
      `),
      dependenceFileRelativePath: z.string().describe(`
        Required! The relative path of the dependency file for the current file. If the dependency file is not found, return an empty string.
        `)
    })
  })

  const aiRes: ReferenceFilePaths = await aiRunnable.invoke({
    input: `
I will provide the relative paths of all current files and the path of the currently edited file.
I would like you to do two things:

1. Find the file path of the dependency file for the current file. Dependency files usually contain configuration for project dependencies. Please identify the dependency file paths based on different programming languages and common dependency file naming conventions. Here are some examples of dependency files for common programming languages:
   - JavaScript/TypeScript: package.json
   - Python: requirements.txt, Pipfile, pyproject.toml
   - Java: pom.xml, build.gradle
   - Ruby: Gemfile
   - PHP: composer.json
   - Rust: Cargo.toml

2. Identify the three most useful files related to the currently edited file. These files should be helpful for editing the current file. I will provide the contents of these files to assist in the editing process.

Please note, do not include very large files such as yarn.lock. Based on this information, please return the relative path of the dependency file for the current file and the three most useful file paths.

Here are the relative paths of all files:
${allRelativePaths.join('\n')}

The path of the currently edited file is:
${currentFileRelativePath}

Please find and return the dependency file path for the current file and the three most useful file paths.
    `
  })

  if (abortController?.signal.aborted) throw AbortError

  return {
    referenceFileRelativePaths:
      aiRes.referenceFileRelativePaths.map(toPlatformPath),
    dependenceFileRelativePath: toPlatformPath(aiRes.dependenceFileRelativePath)
  }
}
