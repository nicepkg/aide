import * as vscode from 'vscode'

export interface Config {
  ignorePatterns: string[]
  aiPromptTemplate: string
  aiCommandTemplate: string
  aiCommandCopyBeforeRun: boolean
}

export const getConfig = (): Config => {
  const config = vscode.workspace.getConfiguration('aide')

  return {
    ignorePatterns: config.get<string[]>('ignorePatterns') || [
      '**/node_modules',
      '**/.git',
      '**/__pycache__',
      '**/.Python',
      '**/.DS_Store',
      '**/.cache',
      '**/.next',
      '**/.nuxt',
      '**/.out',
      '**/dist',
      '**/.serverless',
      '**/.parcel-cache'
    ],
    aiPromptTemplate: config.get<string>('aiPrompt') || '#{content}',
    aiCommandTemplate: config.get<string>('aiCommand') || '',
    aiCommandCopyBeforeRun:
      config.get<boolean>('aiCommandCopyBeforeRun') ?? true
  }
}
