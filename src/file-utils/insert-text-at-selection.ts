import * as vscode from 'vscode'

import { VsCodeFS } from './vscode-fs'

/**
 * Inserts text at the specified selection in a file.
 *
 * @param params - The parameters object.
 * @param params.filePath - The path to the file.
 * @param params.selection - The selection where the text should be inserted.
 * @param params.textToInsert - The text to insert.
 * @returns A promise that resolves to the file content after the text has been inserted.
 */
export const insertTextAtSelection = async ({
  filePath,
  selection,
  textToInsert
}: {
  filePath: string
  selection: vscode.Selection
  textToInsert: string
}): Promise<string> => {
  // read file content
  const fullText = await VsCodeFS.readFileOrOpenDocumentContent(
    filePath,
    'utf-8'
  )
  const lines = fullText.split('\n')

  // get start and end position of selection
  const { start } = selection
  const { end } = selection

  // check if selection is empty
  if (selection.isEmpty) {
    // insert text at cursor position
    const line = lines[start.line] || ''
    lines[start.line] =
      line.slice(0, start.character) +
      textToInsert +
      line.slice(start.character)
  } else {
    // replace selected text
    const startLine = lines[start.line] || ''
    const endLine = lines[end.line] || ''

    if (start.line === end.line) {
      // replace single line text
      lines[start.line] =
        startLine.slice(0, start.character) +
        textToInsert +
        endLine.slice(end.character)
    } else {
      // replace multiple lines text
      const newLines = [
        startLine.slice(0, start.character) +
          textToInsert +
          endLine.slice(end.character)
      ]

      lines.splice(start.line, end.line - start.line + 1, ...newLines)
    }
  }

  // recombine text and return
  return lines.join('\n')
}
