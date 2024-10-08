export interface BaseToolContext {
  enableTool: boolean
}

export enum ContextInfoSource {
  FileSelector = 'file-selector',
  Editor = 'editor',
  ToolNode = 'tool-node'
}

export interface BaseContextInfo {
  source: ContextInfoSource
}
