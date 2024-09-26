import path from 'path'
import {
  traverseFileOrFolders,
  type FileInfo,
  type FolderInfo
} from '@extension/file-utils/traverse-fs'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { getWorkspaceFolder } from '@extension/utils'
import * as vscode from 'vscode'

import { Controller } from '../types'

export class FileController extends Controller {
  readonly name = 'file'

  async readFile(req: {
    path: string
    encoding?: BufferEncoding
  }): Promise<string> {
    return await VsCodeFS.readFileOrOpenDocumentContent(req.path, req.encoding)
  }

  async writeFile(req: {
    path: string
    data: string
    encoding?: BufferEncoding
  }): Promise<void> {
    await VsCodeFS.writeFile(req.path, req.data, req.encoding)
  }

  async mkdir(req: { path: string; recursive?: boolean }): Promise<void> {
    await VsCodeFS.mkdir(req.path, { recursive: req.recursive })
  }

  async rmdir(req: { path: string; recursive?: boolean }): Promise<void> {
    await VsCodeFS.rmdir(req.path, { recursive: req.recursive })
  }

  async unlink(req: { path: string }): Promise<void> {
    await VsCodeFS.unlink(req.path)
  }

  async rename(req: { oldPath: string; newPath: string }): Promise<void> {
    await VsCodeFS.rename(req.oldPath, req.newPath)
  }

  async stat(req: { path: string }): Promise<vscode.FileStat> {
    return await VsCodeFS.stat(req.path)
  }

  async readdir(req: { path: string }): Promise<string[]> {
    return await VsCodeFS.readdir(req.path)
  }

  async getFileInfoForMessage(req: {
    relativePath: string
    startLine?: number
    endLine?: number
  }): Promise<FileInfo | undefined> {
    const workspaceFolder = getWorkspaceFolder()
    const fullPath = path.join(workspaceFolder.uri.fsPath, req.relativePath)
    const fileInfo = await VsCodeFS.stat(fullPath)

    if (!fileInfo || fileInfo.type !== vscode.FileType.File) return

    const fileContent = await VsCodeFS.readFile(fullPath)
    const lines = fileContent.split('\n')
    const startLine = req.startLine ?? 0
    const endLine = req.endLine ?? lines.length - 1
    const code = lines.slice(startLine, endLine + 1).join('\n')

    return {
      type: 'file',
      content: code,
      relativePath: req.relativePath,
      fullPath
    }
  }

  async openFileInEditor(req: {
    path: string
    startLine?: number
  }): Promise<void> {
    if (!req.path) return

    const document = await vscode.workspace.openTextDocument(req.path)
    const startPosition = new vscode.Position(req.startLine ?? 0, 0)

    await vscode.window.showTextDocument(document, {
      preview: true,
      selection: new vscode.Range(startPosition, startPosition)
    })
  }

  async traverseWorkspaceFiles(req: {
    filesOrFolders: string[]
  }): Promise<FileInfo[]> {
    const workspaceFolder = getWorkspaceFolder()
    return await traverseFileOrFolders({
      type: 'file',
      filesOrFolders: req.filesOrFolders,
      isGetFileContent: false,
      workspacePath: workspaceFolder.uri.fsPath,
      itemCallback: fileInfo => fileInfo
    })
  }

  async traverseWorkspaceFolders(req: {
    folders: string[]
  }): Promise<FolderInfo[]> {
    const workspaceFolder = getWorkspaceFolder()
    return await traverseFileOrFolders({
      type: 'folder',
      filesOrFolders: req.folders,
      isGetFileContent: false,
      workspacePath: workspaceFolder.uri.fsPath,
      itemCallback: folderInfo => folderInfo
    })
  }
}
