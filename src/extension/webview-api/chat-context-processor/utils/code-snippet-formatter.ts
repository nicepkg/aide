import path from 'path'
import { getLanguageId } from '@extension/utils'

export interface CodeSnippetInfo {
  relativePath?: string
  language?: string
  code: string
}

export function formatCodeSnippet(
  snippet: CodeSnippetInfo,
  isEspeciallyRelevant: boolean
): string {
  let codeSnippet: string

  if (snippet.relativePath) {
    const languageId = getLanguageId(
      path.extname(snippet.relativePath).slice(1)
    )
    codeSnippet = `\`\`\`${languageId}:${snippet.relativePath}\n${snippet.code}\n\`\`\`\n\n`
  } else {
    codeSnippet = `\`\`\`${snippet.language || ''}\n${snippet.code}\n\`\`\`\n\n`
  }

  if (isEspeciallyRelevant) {
    return `<especially_relevant_code_snippet>\n${codeSnippet}</especially_relevant_code_snippet>\n`
  }
  return codeSnippet
}
