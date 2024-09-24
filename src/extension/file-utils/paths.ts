import crypto from 'crypto'
import os from 'os'
import path from 'path'
import { getWorkspaceFolder } from '@extension/utils'
import fs from 'fs-extra'

import { VsCodeFS } from './vscode-fs'

const AIDE_DIR = process.env.AIDE_GLOBAL_DIR ?? path.join(os.homedir(), '.aide')

export const getExt = (filePath: string): string =>
  path.extname(filePath).slice(1)

export const getSemanticHashName = (
  forSemantic: string,
  forHash?: string
): string => {
  const semanticsName = forSemantic.replace(/[^a-zA-Z0-9]/g, '_')

  if (!forHash) return semanticsName.toLowerCase()

  const hashName = crypto
    .createHash('md5')
    .update(forHash)
    .digest('hex')
    .substring(0, 8)

  return `${semanticsName}_${hashName}`.toLowerCase()
}

export class AidePaths {
  private static instance: AidePaths

  private aideDir: string

  private constructor() {
    this.aideDir = AIDE_DIR
  }

  public static getInstance(): AidePaths {
    if (!AidePaths.instance) {
      AidePaths.instance = new AidePaths()
    }
    return AidePaths.instance
  }

  private ensurePath(pathToEnsure: string, isDirectory: boolean): string {
    if (isDirectory) {
      fs.ensureDirSync(pathToEnsure)
    } else {
      fs.ensureFileSync(pathToEnsure)
    }
    return pathToEnsure
  }

  private joinAideGlobalPath(
    isDirectory: boolean,
    ...segments: string[]
  ): string {
    const fullPath = path.join(this.aideDir, ...segments)
    return this.ensurePath(fullPath, isDirectory)
  }

  private joinAideNamespacePath(
    isDirectory: boolean,
    ...segments: string[]
  ): string {
    const fullPath = path.join(this.aideDir, this.getNamespace(), ...segments)
    return this.ensurePath(fullPath, isDirectory)
  }

  getSessionFilePath = (sessionId: string) =>
    this.joinAideNamespacePath(false, 'sessions', `${sessionId}.json`)

  getSessionsListPath = async () => {
    const filePath = this.joinAideNamespacePath(
      false,
      'sessions',
      'sessions.json'
    )

    if (!fs.existsSync(filePath)) {
      await VsCodeFS.writeJsonFile(filePath, [])
    }

    return filePath
  }

  getLanceDbPath = () => this.joinAideNamespacePath(true, 'lancedb')

  getLogsPath = () => this.joinAideNamespacePath(true, 'logs')

  getNamespace = () => {
    const workspacePath = getWorkspaceFolder().uri.fsPath

    return getSemanticHashName(workspacePath, path.basename(workspacePath))
  }
}

export const aidePaths = AidePaths.getInstance()
