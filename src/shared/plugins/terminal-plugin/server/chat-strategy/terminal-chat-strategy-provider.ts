import type { Conversation } from '@shared/entities'
import type {
  GetAgentState,
  GetMentionState
} from '@shared/plugins/base/base-to-state'
import type { ChatStrategyProvider } from '@shared/plugins/base/server/create-provider-manager'

import { TerminalToState } from '../../terminal-mentions-to-state'
import type { TerminalCommand } from '../../types'

interface ConversationWithStateProps {
  conversation: Conversation
  mentionState: GetMentionState<TerminalToState>
  agentState: GetAgentState<TerminalToState>
}

export class TerminalChatStrategyProvider implements ChatStrategyProvider {
  private createConversationWithStateProps(
    conversation: Conversation
  ): ConversationWithStateProps {
    const terminalToState = new TerminalToState(conversation)
    const mentionState = terminalToState.toMentionsState()
    const agentState = terminalToState.toAgentsState()

    return { conversation, mentionState, agentState }
  }

  async buildContextMessagePrompt(conversation: Conversation): Promise<string> {
    const props = this.createConversationWithStateProps(conversation)

    const terminalLogsPrompt = this.buildTerminalLogsPrompt(props)

    const prompts = [terminalLogsPrompt].filter(Boolean)

    return prompts.join('\n\n')
  }

  private buildTerminalLogsPrompt(props: ConversationWithStateProps): string {
    const { mentionState } = props

    if (!mentionState?.selectedTerminals.length) return ''

    let terminalContent = `
## Terminal Logs
`

    mentionState.selectedTerminals.forEach(terminal => {
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
