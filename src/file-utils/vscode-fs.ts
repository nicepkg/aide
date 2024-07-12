/* eslint-disable unused-imports/no-unused-vars */
import * as vscode from 'vscode'

export class VsCodeFS {
  private static readonly fs: vscode.FileSystem = vscode.workspace.fs

  static async readFile(
    path: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<string> {
    const uri = vscode.Uri.file(path)
    const uint8Array = await this.fs.readFile(uri)
    return Buffer.from(uint8Array).toString(encoding)
  }

  static async writeFile(
    path: string,
    data: string | Uint8Array,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<void> {
    const uri = vscode.Uri.file(path)
    const uint8Array =
      typeof data === 'string' ? Buffer.from(data, encoding) : data
    await this.fs.writeFile(uri, uint8Array)
  }

  static async mkdir(
    path: string,
    options?: { recursive?: boolean }
  ): Promise<void> {
    const uri = vscode.Uri.file(path)
    await this.fs.createDirectory(uri)
  }

  static async rmdir(
    path: string,
    options?: { recursive?: boolean }
  ): Promise<void> {
    const uri = vscode.Uri.file(path)
    await this.fs.delete(uri, { recursive: options?.recursive })
  }

  static async unlink(path: string): Promise<void> {
    const uri = vscode.Uri.file(path)
    await this.fs.delete(uri)
  }

  static async rename(oldPath: string, newPath: string): Promise<void> {
    const oldUri = vscode.Uri.file(oldPath)
    const newUri = vscode.Uri.file(newPath)
    await this.fs.rename(oldUri, newUri)
  }

  static async stat(path: string): Promise<vscode.FileStat> {
    const uri = vscode.Uri.file(path)
    return await this.fs.stat(uri)
  }

  static async readdir(path: string): Promise<string[]> {
    const uri = vscode.Uri.file(path)
    const entries = await this.fs.readDirectory(uri)
    return entries.map(([name]) => name)
  }
}
