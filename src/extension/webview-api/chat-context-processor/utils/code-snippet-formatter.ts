import path from 'path'
import { getLanguageId } from '@shared/utils/vscode-lang'

export interface CodeSnippetInfo {
  relativePath?: string
  language?: string
  code: string
  showLine: boolean
  startLine?: number
  endLine?: number
}

export function formatCodeSnippet(
  snippet: CodeSnippetInfo,
  isEspeciallyRelevant?: boolean
): string {
  const languageId = snippet.relativePath
    ? getLanguageId(path.extname(snippet.relativePath).slice(1))
    : snippet.language || ''

  const codeLines = snippet.showLine ? snippet.code.split('\n') : null
  const startLine = Math.max(1, snippet.startLine || 1)
  const endLine =
    snippet.endLine ||
    (codeLines ? startLine + codeLines.length - 1 : startLine)

  if (startLine > endLine) {
    throw new Error('startLine cannot be greater than endLine')
  }

  let formattedCode: string

  if (snippet.showLine && codeLines) {
    let result = ''
    for (let i = 0; i < codeLines.length; i++) {
      result += `${startLine + i}|${codeLines[i]}\n`
    }
    formattedCode = result.trimEnd()
  } else {
    formattedCode = snippet.code
  }

  const codeBlock = snippet.relativePath
    ? `\`\`\`${languageId}:${snippet.relativePath}\n${formattedCode}\n\`\`\``
    : `\`\`\`${languageId}\n${formattedCode}\n\`\`\``

  return isEspeciallyRelevant
    ? `<especially_relevant_code_snippet>\n${codeBlock}\n</especially_relevant_code_snippet>\n`
    : `${codeBlock}\n\n`
}
