import * as path from 'path'
import { t } from '@extension/i18n'
import { getWorkspaceFolder } from '@extension/utils'
import * as vscode from 'vscode'

import { BaseRegister } from './base.register'

class CheckboxTreeItem extends vscode.TreeItem {
  constructor(
    public readonly resourceUri: vscode.Uri,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public checked: boolean,
    private treeDataProvider: CheckboxFileTreeProvider
  ) {
    super(resourceUri, collapsibleState)
    this.contextValue = 'checkboxTreeItem'
    this.checkboxState = vscode.TreeItemCheckboxState.Unchecked
    this.updateCheckbox()
    this.updateCommand()
  }

  updateCheckbox() {
    this.checkboxState = this.checked
      ? vscode.TreeItemCheckboxState.Checked
      : vscode.TreeItemCheckboxState.Unchecked
  }

  updateCommand() {
    if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
      // For files
      this.command = {
        command: 'aide.checkboxFileTree.openFile',
        title: 'Open File',
        arguments: [this.resourceUri]
      }
    }
  }
}

class CheckboxFileTreeProvider
  implements vscode.TreeDataProvider<CheckboxTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    CheckboxTreeItem | undefined | null | void
  > = new vscode.EventEmitter<CheckboxTreeItem | undefined | null | void>()

  readonly onDidChangeTreeData: vscode.Event<
    CheckboxTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event

  private checkedItems: Set<string> = new Set()

  constructor(private workspaceRoot: string | undefined) {}

  refresh(item?: CheckboxTreeItem): void {
    this._onDidChangeTreeData.fire(item)
  }

  getTreeItem(element: CheckboxTreeItem): vscode.TreeItem {
    return element
  }

  getChildren(element?: CheckboxTreeItem): Thenable<CheckboxTreeItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage(t('error.noWorkspace'))
      return Promise.resolve([])
    }

    const dir = element ? element.resourceUri.fsPath : this.workspaceRoot
    return this.getDirectoryContents(dir)
  }

  private async getDirectoryContents(dir: string): Promise<CheckboxTreeItem[]> {
    const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dir))
    return files.map(([name, type]) => {
      const filePath = path.join(dir, name)
      const uri = vscode.Uri.file(filePath)
      const isDirectory = type === vscode.FileType.Directory
      const item = new CheckboxTreeItem(
        uri,
        isDirectory
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None,
        this.checkedItems.has(uri.fsPath),
        this
      )
      return item
    })
  }

  toggleCheckbox(item: CheckboxTreeItem) {
    item.checked = !item.checked
    if (item.checked) {
      this.checkedItems.add(item.resourceUri.fsPath)
    } else {
      this.checkedItems.delete(item.resourceUri.fsPath)
    }
    item.updateCheckbox()
    this.refresh(item)
  }

  getCheckedItems(): string[] {
    return Array.from(this.checkedItems)
  }
}

export class CheckboxFileTreeRegister extends BaseRegister {
  private treeDataProvider: CheckboxFileTreeProvider | undefined

  private treeView: vscode.TreeView<CheckboxTreeItem> | undefined

  register(): void {
    const workspaceRoot = getWorkspaceFolder(false)?.uri.fsPath

    this.treeDataProvider = new CheckboxFileTreeProvider(workspaceRoot)

    this.treeView = vscode.window.createTreeView('aide.checkboxFileTree', {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
      canSelectMany: false
    })

    this.context.subscriptions.push(this.treeView)

    const toggleCheckboxDisposable = vscode.commands.registerCommand(
      'aide.checkboxFileTree.toggleCheckbox',
      (item: CheckboxTreeItem) => {
        this.treeDataProvider?.toggleCheckbox(item)
      }
    )
    this.context.subscriptions.push(toggleCheckboxDisposable)

    const refreshDisposable = vscode.commands.registerCommand(
      'aide.checkboxFileTree.refresh',
      () => {
        this.treeDataProvider?.refresh()
      }
    )
    this.context.subscriptions.push(refreshDisposable)

    const openFileDisposable = vscode.commands.registerCommand(
      'aide.checkboxFileTree.openFile',
      (resource: vscode.Uri) => {
        vscode.window.showTextDocument(resource)
      }
    )
    this.context.subscriptions.push(openFileDisposable)
  }

  cleanup(): void {
    this.treeView?.dispose()
  }
}
