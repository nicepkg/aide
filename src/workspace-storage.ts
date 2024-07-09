import * as vscode from 'vscode'

export interface WorkspaceState {}

export class WorkspaceStorage {
  private static _context: vscode.ExtensionContext

  private static readonly PREFIX = 'aide.'

  public static initialize(context: vscode.ExtensionContext): void {
    WorkspaceStorage._context = context
  }

  private static prefixKey(key: string): string {
    return WorkspaceStorage.PREFIX + key
  }

  public static setItem<K extends keyof WorkspaceState>(
    key: K,
    value: WorkspaceState[K]
  ): void {
    if (!WorkspaceStorage._context) {
      throw new Error('WorkspaceStorage not initialized')
    }
    WorkspaceStorage._context.workspaceState.update(
      this.prefixKey(key as string),
      value
    )
  }

  public static getItem<K extends keyof WorkspaceState>(
    key: K
  ): WorkspaceState[K] | undefined {
    if (!WorkspaceStorage._context) {
      throw new Error('WorkspaceStorage not initialized')
    }
    return WorkspaceStorage._context.workspaceState.get(
      this.prefixKey(key as string)
    )
  }

  public static removeItem<K extends keyof WorkspaceState>(key: K): void {
    if (!WorkspaceStorage._context) {
      throw new Error('WorkspaceStorage not initialized')
    }
    WorkspaceStorage._context.workspaceState.update(
      this.prefixKey(key as string),
      undefined
    )
  }

  public static clear(): void {
    if (!WorkspaceStorage._context) {
      throw new Error('WorkspaceStorage not initialized')
    }
    const keys = WorkspaceStorage._context.workspaceState.keys()
    keys.forEach(key => {
      if (key.startsWith(WorkspaceStorage.PREFIX)) {
        WorkspaceStorage._context.workspaceState.update(key, undefined)
      }
    })
  }
}
