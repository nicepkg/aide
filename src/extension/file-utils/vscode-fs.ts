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

  static _getOpenTextDocumentContent(path: string): string | undefined {
    const documents = vscode.workspace.textDocuments
    const document = documents.find(doc => doc.uri.fsPath === path)
    return document?.getText()
  }

  /**
   * Reads the content of a file, prioritizing open documents in VS Code.
   *
   * This method addresses a limitation of the standard file system read operations
   * in VS Code extensions. While `vscode.workspace.fs.readFile()` only reads the
   * content saved on disk, this method also considers unsaved changes in open editors.
   *
   * The method works as follows:
   * 1. It first checks if the file is open in any VS Code text editor.
   * 2. If the file is open, it returns the current content of the document,
   *    including any unsaved changes.
   * 3. If the file is not open in any editor, it falls back to reading the file
   *    content from the disk.
   *
   * This approach ensures that the most up-to-date content is always returned,
   * whether it's the saved file on disk or the current state in an open editor.
   *
   */
  static async readFileOrOpenDocumentContent(
    path: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<string> {
    const openDocumentContent = this._getOpenTextDocumentContent(path)
    if (openDocumentContent !== undefined) {
      return openDocumentContent
    }
    return await this.readFile(path, encoding)
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
