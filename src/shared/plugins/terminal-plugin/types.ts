import type { TerminalInfo } from '@extension/registers/terminal-watcher-register'

export type {
  TerminalInfo,
  TerminalCommand
} from '@extension/registers/terminal-watcher-register'

export interface TerminalPluginState {
  selectedTerminalsFromEditor: TerminalInfo[]
  terminalLogsFromAgent: TerminalInfo[]
}
