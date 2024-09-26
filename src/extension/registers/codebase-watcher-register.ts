import { CodebaseIndexer } from '@extension/webview-api/chat-context-processor/vectordb/codebase-indexer'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'

export class CodebaseWatcherRegister extends BaseRegister {
  private fileSystemWatcher: vscode.FileSystemWatcher | undefined

  indexer: CodebaseIndexer | undefined

  async register(): Promise<void> {
    this.indexer = new CodebaseIndexer()

    // Initialize the indexer
    await this.indexer.initialize()

    // Create a file system watcher for all files
    this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*')

    // Handle file changes
    this.fileSystemWatcher.onDidChange(uri =>
      this.handleFileEvent(uri, 'change')
    )
    this.fileSystemWatcher.onDidCreate(uri =>
      this.handleFileEvent(uri, 'create')
    )
    this.fileSystemWatcher.onDidDelete(uri =>
      this.handleFileEvent(uri, 'delete')
    )
  }

  private handleFileEvent(
    uri: vscode.Uri,
    eventType: 'change' | 'create' | 'delete'
  ): void {
    const filePath = uri.fsPath

    if (eventType === 'delete') {
      this.indexer?.handleFileDelete(filePath)
    } else {
      this.indexer?.handleFileChange(filePath)
    }
  }

  cleanup(): void {
    this.fileSystemWatcher?.dispose()
  }
}
