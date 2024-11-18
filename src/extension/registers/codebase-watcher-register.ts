import { aidePaths } from '@extension/file-utils/paths'
import { getWorkspaceFolder } from '@extension/utils'
import { CodebaseIndexer } from '@extension/webview-api/chat-context-processor/vectordb/codebase-indexer'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'

export class CodebaseWatcherRegister extends BaseRegister {
  private fileSystemWatcher: vscode.FileSystemWatcher | undefined

  private disposes: vscode.Disposable[] = []

  indexer: CodebaseIndexer | undefined

  async register(): Promise<void> {
    const workspaceRootPath = getWorkspaceFolder()?.uri.fsPath
    const dbPath = aidePaths.getWorkspaceLanceDbPath()
    this.indexer = new CodebaseIndexer(workspaceRootPath, dbPath)

    // Initialize the indexer
    await this.indexer.initialize()

    // Create a file system watcher for all files
    this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*')

    // Handle file changes
    this.disposes.push(
      this.fileSystemWatcher.onDidChange(uri =>
        this.handleFileEvent(uri, 'change')
      ),
      this.fileSystemWatcher.onDidCreate(uri =>
        this.handleFileEvent(uri, 'create')
      ),
      this.fileSystemWatcher.onDidDelete(uri =>
        this.handleFileEvent(uri, 'delete')
      )
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

  dispose(): void {
    this.fileSystemWatcher?.dispose()
    this.indexer?.dispose()
    this.disposes.forEach(dispose => dispose.dispose())
    this.disposes = []
  }
}