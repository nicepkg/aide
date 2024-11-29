import path from 'path'
import {
  getTreeInfo,
  getWorkspaceTreesInfo
} from '@extension/file-utils/generate-tree'
import {
  traverseFileOrFolders,
  type FileInfo,
  type FolderInfo
} from '@extension/file-utils/traverse-fs'
import { VsCodeFS } from '@extension/file-utils/vscode-fs'
import { logger } from '@extension/logger'
import { getWorkspaceFolder } from '@extension/utils'
import type { EditorError, TreeInfo } from '@shared/plugins/fs-plugin/types'
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

  async getFullPath(req: {
    path: string
    returnNullIfNotExists?: boolean
  }): Promise<string | null> {
    try {
      const workspaceFolder = getWorkspaceFolder()
      const absolutePath = path.isAbsolute(req.path)
        ? req.path
        : path.join(workspaceFolder.uri.fsPath, req.path)
      const stat = await VsCodeFS.stat(absolutePath)

      if (
        req.returnNullIfNotExists &&
        stat.type !== vscode.FileType.File &&
        stat.type !== vscode.FileType.Directory
      )
        return null

      return absolutePath
    } catch {
      return null
    }
  }

  async getFileInfoForMessage(req: {
    relativePath: string
    startLine?: number
    endLine?: number
  }): Promise<FileInfo | null> {
    try {
      const workspaceFolder = getWorkspaceFolder()
      const fullPath = path.join(workspaceFolder.uri.fsPath, req.relativePath)
      const fileInfo = await VsCodeFS.stat(fullPath)

      if (!fileInfo || fileInfo.type !== vscode.FileType.File) return null

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
    } catch (error) {
      logger.error('Error getting file info for message:', error)
      return null
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

  async getCurrentEditorErrors(): Promise<EditorError[]> {
    const errors: EditorError[] = []

    try {
      // Get all open text documents
      const documents = vscode.workspace.textDocuments

      // Collect diagnostics for each document
      for (const document of documents) {
        // Skip non-file documents (like output/debug console)
        if (document.uri.scheme !== 'file') continue

        // Get all diagnostic collections
        const allDiagnostics: vscode.Diagnostic[] = []

        // Get diagnostics from all providers (TypeScript, ESLint, etc)
        const collections = vscode.languages.getDiagnostics(document.uri)
        allDiagnostics.push(...collections)

        // Get diagnostics from other language features
        const languageFeatures = vscode.languages.getDiagnostics()
        for (const [uri, diagnostics] of languageFeatures) {
          if (uri.toString() === document.uri.toString()) {
            allDiagnostics.push(...diagnostics)
          }
        }

        // Convert diagnostics to EditorError format
        const documentErrors = allDiagnostics.map(d => {
          // Try to get more specific error source/type
          const source = d.source || 'unknown'
          const code = d.code
            ? typeof d.code === 'object'
              ? d.code.value
              : d.code.toString()
            : undefined

          // Format code with source if available
          const errorCode = source && code ? `${source}/${code}` : code

          return {
            message: d.message,
            code: String(errorCode || ''),
            severity:
              d.severity === vscode.DiagnosticSeverity.Error
                ? 'error'
                : 'warning',
            file: vscode.workspace.asRelativePath(document.uri),
            line: d.range.start.line + 1,
            column: d.range.start.character + 1
          } satisfies EditorError
        })

        errors.push(...documentErrors)
      }

      // Remove duplicates based on message and location
      return errors.filter(
        (error, index, self) =>
          index ===
          self.findIndex(
            e =>
              e.message === error.message &&
              e.file === error.file &&
              e.line === error.line &&
              e.column === error.column
          )
      )
    } catch (error) {
      logger.error('Error getting editor diagnostics:', error)
      return []
    }
  }

  async getTreeInfo(req: { path: string }): Promise<TreeInfo | undefined> {
    try {
      const workspaceFolder = getWorkspaceFolder()
      const fullPath = path.isAbsolute(req.path)
        ? req.path
        : path.join(workspaceFolder.uri.fsPath, req.path)

      return await getTreeInfo(fullPath)
    } catch (error) {
      logger.error('Error getting tree info:', error)
      return undefined
    }
  }

  async getWorkspaceTreesInfo(req: { depth?: number }): Promise<TreeInfo[]> {
    try {
      return await getWorkspaceTreesInfo(req.depth)
    } catch (error) {
      logger.error('Error getting workspace trees info:', error)
      return []
    }
  }
}
