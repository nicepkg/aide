import type { CommandManager } from '@extension/commands/command-manager'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'
import type { RegisterManager } from './register-manager'

export class TmpFileSchemaRegister extends BaseRegister {
  public tmpFileContentProvider: AideTmpFileContentProvider | undefined

  private disposes: vscode.Disposable[] = []

  constructor(
    protected context: vscode.ExtensionContext,
    protected registerManager: RegisterManager,
    protected commandManager: CommandManager
  ) {
    super(context, registerManager, commandManager)
  }

  async register(): Promise<void> {
    this.tmpFileContentProvider = new AideTmpFileContentProvider()

    this.disposes.push(
      vscode.Disposable.from(this.tmpFileContentProvider),
      vscode.workspace.registerTextDocumentContentProvider(
        'aide',
        this.tmpFileContentProvider
      )
    )
  }

  dispose(): void {
    this.disposes.forEach(d => d.dispose())
    this.disposes = []
    this.tmpFileContentProvider = undefined
  }
}

export class AideTmpFileContentProvider
  implements vscode.TextDocumentContentProvider, vscode.Disposable
{
  private idFileContentMap = new Map<string, string>()

  private filePathIdsMap = new Map<string, string[]>()

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>()

  private disposes: vscode.Disposable[] = []

  constructor() {
    this.disposes.push(
      vscode.workspace.onDidCloseTextDocument(doc =>
        this.deleteByFilePath(doc.uri.fsPath)
      )
    )
  }

  // Get content from the content store
  public provideTextDocumentContent(uri: vscode.Uri): string {
    const id = uri.fragment
    return this.idFileContentMap.get(id) || ''
  }

  // Add to store - store origin content by fixup task id
  public async set(id: string, docUri: vscode.Uri): Promise<void> {
    const doc = await vscode.workspace.openTextDocument(docUri)
    this.idFileContentMap.set(id, doc.getText())
    this.filePathIdsMap.set(docUri.fsPath, [
      ...(this.filePathIdsMap.get(docUri.fsPath) || []),
      id
    ])
  }

  // Remove by ID
  public delete(id: string): void {
    this.idFileContentMap.delete(id)
    for (const [filePath, ids] of this.filePathIdsMap) {
      const index = ids.indexOf(id)
      if (index > -1) {
        ids.splice(index, 1)
      }
      if (ids.length === 0) {
        this.deleteByFilePath(filePath)
      }
    }
  }

  // Remove by file path
  private deleteByFilePath(filePath: string): void {
    const files = this.filePathIdsMap.get(filePath)
    if (!files) {
      return
    }
    for (const id of files) {
      this.idFileContentMap.delete(id)
    }
  }

  public get onDidChange(): vscode.Event<vscode.Uri> {
    return this._onDidChange.event
  }

  public dispose = (): void => {
    this.disposes.forEach(d => d.dispose())
    this._onDidChange.dispose()
    this.idFileContentMap = new Map()
    this.filePathIdsMap = new Map()
  }
}
