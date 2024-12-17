import type { TerminalInfo } from '@extension/registers/terminal-watcher-register'
import type { Mention } from '@shared/entities'

import { PluginId } from '../base/types'

export type {
  TerminalInfo,
  TerminalCommand
} from '@extension/registers/terminal-watcher-register'

export enum TerminalMentionType {
  Terminals = `${PluginId.Terminal}#terminals`,
  Terminal = `${PluginId.Terminal}#terminal`
}

export type TerminalMention = Mention<
  TerminalMentionType.Terminal,
  TerminalInfo
>

export interface TerminalPluginState {}
