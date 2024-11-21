import type { Conversation } from '@shared/entities'
import type { ChatStrategyProvider } from '@shared/plugins/base/server/create-provider-manager'
import { PluginId } from '@shared/plugins/base/types'

import type { TerminalCommand, TerminalPluginState } from '../../types'

export class TerminalChatStrategyProvider implements ChatStrategyProvider {
  async buildContextMessagePrompt(conversation: Conversation): Promise<string> {
    const state = conversation.pluginStates?.[PluginId.Terminal] as
      | Partial<TerminalPluginState>
      | undefined

    if (!state) return ''

    const terminalLogsPrompt = this.buildTerminalLogsPrompt(state)

    const prompts = [terminalLogsPrompt].filter(Boolean)

    return prompts.join('\n\n')
  }

  private buildTerminalLogsPrompt(state: Partial<TerminalPluginState>): string {
    const { selectedTerminalsFromEditor = [] } = state

    if (!selectedTerminalsFromEditor.length) return ''

    let terminalContent = `
## Terminal Logs
`

    selectedTerminalsFromEditor.forEach(terminal => {
      terminalContent += `
Terminal: ${terminal.name}
${terminal.commands.map(cmd => this.buildTerminalCommandPrompt(cmd)).join('\n')}
`
    })

    return terminalContent
  }

  private buildTerminalCommandPrompt(command: TerminalCommand): string {
    return `
Working Directory: ${command.cwd || 'Unknown'}
Command: ${command.input}
Output: ${command.output}
Exit Code: ${command.exitCode}
`
  }
}
