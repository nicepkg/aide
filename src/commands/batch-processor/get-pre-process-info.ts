import path from 'path'
import { createModelProvider } from '@/ai/helpers'
import { AbortError } from '@/constants'
import { traverseFileOrFolders } from '@/file-utils/traverse-fs'
import { getCurrentWorkspaceFolderEditor, toPlatformPath } from '@/utils'
import { z } from 'zod'

export interface PreProcessInfo {
  processFilePathInfo: {
    sourceFileRelativePath: string
    processedFileRelativePath: string
    referenceFileRelativePaths: string[]
  }[]
  dependenceFileRelativePath?: string
  ignoreFileRelativePaths?: string[]
}

export const getPreProcessInfo = async ({
  prompt,
  fileRelativePathsForProcess,
  abortController
}: {
  prompt: string
  fileRelativePathsForProcess: string[]
  abortController?: AbortController
}): Promise<
  PreProcessInfo & {
    allFileRelativePaths: string[]
  }
> => {
  const { workspaceFolder } = await getCurrentWorkspaceFolderEditor()
  const allFileRelativePaths: string[] = []

  await traverseFileOrFolders(
    [workspaceFolder.uri.fsPath],
    workspaceFolder.uri.fsPath,
    fileInfo => {
      allFileRelativePaths.push(fileInfo.relativePath)
    }
  )

  const modelProvider = await createModelProvider()
  const aiRunnable = await modelProvider.createStructuredOutputRunnable({
    signal: abortController?.signal,
    useHistory: false,
    zodSchema: z.object({
      processFilePathInfo: z
        .array(
          z.object({
            sourceFileRelativePath: z
              .string()
              .describe(
                `Required! The relative path of the source file to be processed.`
              ),
            processedFileRelativePath: z
              .string()
              .describe(
                `Required! The relative path of the processed file. It should be identical to the source path, except for a possible change in file extension.`
              ),
            referenceFileRelativePaths: z
              .array(z.string())
              .min(0)
              .max(3)
              .optional()
              .describe(
                `Required! Up to three relative paths of files that are useful for processing the source file.`
              )
          })
        )
        .min(0)
        .max(fileRelativePathsForProcess.length)
        .describe(`Required!`),
      dependenceFileRelativePath: z.string().optional().describe(`
        The relative path of the dependency file for the current project.
        **Ensure that very large files, such as yarn.lock, are not included in the results.**
      `),
      ignoreFileRelativePaths: z
        .array(z.string())
        .optional()
        .describe(
          `The relative paths of the files that should be ignored during the processing.`
        )
    })
  })

  const aiRes: PreProcessInfo = await aiRunnable.invoke({
    input: `
I need your help to analyze a list of files for a code conversion project. I'll provide you with all file paths in the project and a list of selected files for processing. Please perform the following tasks:

1. Identify the main dependency file for the project (e.g., package.json, requirements.txt, pom.xml). Ensure that very large files, such as yarn.lock, are not included in the results.

2. For each selected file, determine:
   a) The source file path
   b) The processed file path. This should be identical to the source path, except for a possible change in file extension.
      For example, in a Vue to React conversion, 'src/CheckBox.vue' would become 'src/CheckBox.tsx', but not 'src/check-box.tsx'.
      Another example, add comment for Vue files, 'src/CheckBox.vue' would become 'src/CheckBox.vue'.
   c) Up to 3 related files that might be useful during the conversion process

3. Identify any files from the selected list that should be ignored during the conversion. These might include:
   - Static asset files (e.g., .css, .scss, .less, .svg, .png, .jpg)
   - Configuration files that don't need conversion (e.g., .eslintrc, .prettierrc)
   - Files that are not typically converted in the given scenario (e.g., test files if not part of the conversion scope)

Here's some important context:
- We're working on a code conversion project, likely involving framework or language migration.
- The goal is to prepare a list of files for processing, identify related files, and exclude files that don't need conversion.
- Use your judgment to determine which files should be processed, referenced, or ignored based on common development practices.

All file paths in the project:
${allFileRelativePaths.join('\n')}

Selected files for processing:
${fileRelativePathsForProcess.join('\n')}

Requirement:
${prompt}

Please analyze these files and provide the requested information to help streamline the conversion process.
    `
  })

  if (abortController?.signal.aborted) throw AbortError

  aiRes.dependenceFileRelativePath = toPlatformPath(
    aiRes.dependenceFileRelativePath || ''
  )
  aiRes.ignoreFileRelativePaths =
    aiRes.ignoreFileRelativePaths?.map(toPlatformPath)
  aiRes.processFilePathInfo = aiRes.processFilePathInfo.map(info => ({
    sourceFileRelativePath: toPlatformPath(info.sourceFileRelativePath),
    processedFileRelativePath: toPlatformPath(info.processedFileRelativePath),
    referenceFileRelativePaths:
      info.referenceFileRelativePaths.map(toPlatformPath)
  }))

  // data cleaning
  // Process and filter the file path information
  const finalProcessFilePathInfo: PreProcessInfo['processFilePathInfo'] =
    aiRes.processFilePathInfo
      .map(info => {
        const {
          sourceFileRelativePath,
          processedFileRelativePath,
          referenceFileRelativePaths
        } = info
        const { ignoreFileRelativePaths } = aiRes

        // Extract the base name and extension from the source file path
        const sourceBaseName = path.basename(
          sourceFileRelativePath,
          path.extname(sourceFileRelativePath)
        )
        // Get the extension from the processed file path
        const processedExtName = path.extname(processedFileRelativePath)
        // Construct the full processed file path
        const fullProcessedPath = path.join(
          path.dirname(sourceFileRelativePath),
          sourceBaseName + processedExtName
        )

        // Check if the processed file path should be ignored
        const shouldIgnore =
          fullProcessedPath === sourceFileRelativePath &&
          ignoreFileRelativePaths?.includes(sourceFileRelativePath)

        // Return the new info object or null if it should be ignored
        return shouldIgnore
          ? null
          : {
              sourceFileRelativePath,
              processedFileRelativePath: toPlatformPath(fullProcessedPath),
              referenceFileRelativePaths
            }
      })
      // Filter out any null entries
      .filter(
        (info): info is PreProcessInfo['processFilePathInfo'][0] =>
          info !== null
      )

  return {
    ...aiRes,
    processFilePathInfo: finalProcessFilePathInfo,
    allFileRelativePaths
  }
}
