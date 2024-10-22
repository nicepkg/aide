import * as path from 'path'
import type { CommandManager } from '@extension/commands/command-manager'
import type { TmpFile } from '@extension/file-utils/apply-file/tmp-file'
import { TmpFileManager } from '@extension/file-utils/apply-file/tmp-file-manager'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'
import type { RegisterManager } from './register-manager'

export enum DiffStatus {
  IDLE = 'idle',
  REVIEWING = 'reviewing',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface DiffInfo {
  id: string
  originalUri: vscode.Uri
  tmpFile: TmpFile
  status: DiffStatus
  range: vscode.Range
}

export class DiffRegister extends BaseRegister {
  public diffs: Map<string, DiffInfo> = new Map()

  public tmpFileManager: TmpFileManager

  private disposes: vscode.Disposable[] = []

  constructor(
    protected context: vscode.ExtensionContext,
    protected registerManager: RegisterManager,
    protected commandManager: CommandManager
  ) {
    super(context, registerManager, commandManager)
    this.tmpFileManager = new TmpFileManager()
  }

  async register(): Promise<void> {
    this.disposes.push(
      vscode.commands.registerCommand(
        'aide.createDiff',
        this.createDiff.bind(this)
      ),
      vscode.commands.registerCommand(
        'aide.acceptDiff',
        this.acceptDiff.bind(this)
      ),
      vscode.commands.registerCommand(
        'aide.rejectDiff',
        this.rejectDiff.bind(this)
      ),
      vscode.commands.registerCommand(
        'aide.getDiffStatus',
        this.getDiffStatus.bind(this)
      ),
      vscode.languages.registerCodeLensProvider(
        { scheme: '*' },
        new DiffViewerCodeLensProvider(this)
      ),
      vscode.workspace.onDidCloseTextDocument(
        this.onDidCloseTextDocument.bind(this)
      )
    )
  }

  async createDiff(
    sourceUri: vscode.Uri,
    tmpUri: vscode.Uri,
    id: string
  ): Promise<void> {
    const tmpFile = await this.tmpFileManager.createTmpFile({
      originalFileUri: sourceUri,
      tmpFileUri: tmpUri,
      taskId: id
    })

    const range = await this.calculateDiffRange(sourceUri, tmpUri)

    const diffInfo: DiffInfo = {
      id,
      originalUri: sourceUri,
      tmpFile,
      status: DiffStatus.REVIEWING,
      range
    }
    this.diffs.set(id, diffInfo)

    await this.openDiffEditor(sourceUri, tmpUri)
  }

  private async calculateDiffRange(
    originalUri: vscode.Uri,
    tmpUri: vscode.Uri
  ): Promise<vscode.Range> {
    const originalContent = await VsCodeFS.readFileOrOpenDocumentContent(
      originalUri.fsPath
    )
    const tmpContent = await VsCodeFS.readFileOrOpenDocumentContent(
      tmpUri.fsPath
    )
    const originalLines = originalContent.split('\n')
    const tmpLines = tmpContent.split('\n')

    let startLine = 0
    while (
      startLine < originalLines.length &&
      startLine < tmpLines.length &&
      originalLines[startLine] === tmpLines[startLine]
    ) {
      startLine++
    }

    return new vscode.Range(startLine, 0, startLine + 1, 0)
  }

  private async openDiffEditor(
    leftUri: vscode.Uri,
    rightUri: vscode.Uri
  ): Promise<void> {
    // If there is more than one editor group, maximize the current group
    if (vscode.window.tabGroups.all.length > 1) {
      await vscode.commands.executeCommand(
        'workbench.action.toggleMaximizeEditorGroup'
      )
    }

    const toFileTitle = path.basename(leftUri.fsPath)
    const title = `Diff: AI Changes ↔ ${toFileTitle}`
    await vscode.commands.executeCommand(
      'vscode.diff',
      leftUri,
      rightUri,
      title,
      {
        preview: true,
        preserveFocus: false,
        label: 'Diff View',
        description: `Diff View: ${rightUri.fsPath}`
      }
    )
  }

  async acceptDiff(id: string): Promise<void> {
    const diffInfo = this.diffs.get(id)
    if (!diffInfo) return

    const { originalUri, tmpFile } = diffInfo
    const newContent = await VsCodeFS.readFileOrOpenDocumentContent(
      tmpFile.tmpFileUri.fsPath
    )
    await VsCodeFS.writeFile(originalUri.fsPath, newContent, 'utf-8')

    diffInfo.status = DiffStatus.ACCEPTED
    await this.cleanUpDiff(id)
  }

  async rejectDiff(id: string): Promise<void> {
    const diffInfo = this.diffs.get(id)
    if (!diffInfo) return

    diffInfo.status = DiffStatus.REJECTED
    await this.cleanUpDiff(id)
  }

  getDiffStatus(id: string): DiffStatus | undefined {
    return this.diffs.get(id)?.status
  }

  private async cleanUpDiff(id: string): Promise<void> {
    const diffInfo = this.diffs.get(id)
    if (!diffInfo) return

    await diffInfo.tmpFile.close()
    this.diffs.delete(id)
  }

  private async onDidCloseTextDocument(
    document: vscode.TextDocument
  ): Promise<void> {
    for (const [id, diffInfo] of this.diffs.entries()) {
      if (diffInfo.tmpFile.tmpFileUri.fsPath === document.uri.fsPath) {
        await this.cleanUpDiff(id)
        break
      }
    }
  }

  dispose(): void | Promise<void> {
    this.disposes.forEach(dispose => dispose.dispose())
    this.diffs = new Map()
    this.disposes = []
  }
}

class DiffViewerCodeLensProvider implements vscode.CodeLensProvider {
  constructor(private diffRegister: DiffRegister) {}

  provideCodeLenses(
    document: vscode.TextDocument,
    _: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    const id = document.uri.toString()
    const diffInfo = this.diffRegister.diffs.get(id)
    if (!diffInfo) return []

    return [
      new vscode.CodeLens(diffInfo.range, {
        title: `Accept All ✅ (⌘⏎)`,
        command: 'aide.acceptDiff',
        arguments: [id]
      }),
      new vscode.CodeLens(diffInfo.range, {
        title: `Reject All ❌ (⌘⌫)`,
        command: 'aide.rejectDiff',
        arguments: [id]
      })
    ]
  }
}
