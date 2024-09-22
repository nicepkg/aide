import os from 'os'
import path from 'path'
import JSONC from 'comment-json'
import fs from 'fs-extra'

const AIDE_DIR = process.env.AIDE_GLOBAL_DIR ?? path.join(os.homedir(), '.aide')

export class PathManager {
  static ensureDir(dirPath: string): string {
    fs.ensureDirSync(dirPath)
    return dirPath
  }

  static getPath(...segments: string[]): string {
    return PathManager.ensureDir(path.join(AIDE_DIR, ...segments))
  }

  static getFilePath(...segments: string[]): string {
    return path.join(AIDE_DIR, ...segments)
  }

  static writeJsonFile(filePath: string, data: any): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  }

  static readJsonFile(filePath: string): any {
    return JSONC.parse(fs.readFileSync(filePath, 'utf8'))
  }

  static getExt(filePath: string): string {
    return path.extname(filePath).slice(1)
  }
}

export const Paths = {
  aideDir: AIDE_DIR,
  config: () => PathManager.getFilePath('index', 'config.json'),
  sessionFile: (sessionId: string) =>
    PathManager.getFilePath('sessions', `${sessionId}.json`),
  sessionsList: () => {
    const filePath = PathManager.getFilePath('sessions', 'sessions.json')
    if (!fs.existsSync(filePath)) {
      PathManager.writeJsonFile(filePath, [])
    }
    return filePath
  },
  lanceDb: () => PathManager.getPath('index', 'lancedb'),
  logs: () => PathManager.getPath('logs')
}
