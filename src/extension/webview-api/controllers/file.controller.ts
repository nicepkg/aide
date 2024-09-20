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
