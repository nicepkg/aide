import { getActiveEditor } from '@extension/utils'
import * as vscode from 'vscode'

import { AIDE_TMP_FILE_REGEX, isTmpFileUri } from './is-tmp-file-uri'

export const getOriginalFileUri = (tmpFileUri?: vscode.Uri): vscode.Uri => {
  const fileUri = tmpFileUri || getActiveEditor().document.uri
  const isAideGeneratedFile = isTmpFileUri(fileUri)

  if (isAideGeneratedFile) {
    return vscode.Uri.file(fileUri.fsPath.replace(AIDE_TMP_FILE_REGEX, ''))
  }

  return getActiveEditor().document.uri
}
