import type {
  ClientPlugin,
  ClientPluginContext
} from '@shared/plugins/base/client/client-plugin-context'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'
import { api } from '@webview/services/api-client'
import { type MentionOption } from '@webview/types/chat'
import { SquareTerminalIcon } from 'lucide-react'

import type { TerminalInfo, TerminalPluginState } from '../types'
import { MentionTerminalPreview } from './mention-terminal-preview'

export class TerminalClientPlugin implements ClientPlugin<TerminalPluginState> {
  id = PluginId.Terminal

  version: string = pkg.version

  private context: ClientPluginContext<TerminalPluginState> | null = null

  getInitState() {
    return {
      selectedTerminalsFromEditor: [],
      terminalLogsFromAgent: []
    }
  }

  async activate(
    context: ClientPluginContext<TerminalPluginState>
  ): Promise<void> {
    this.context = context

    this.context.registerProvider('state', () => this.context!.state)
    this.context.registerProvider('editor', () => ({
      getMentionOptions: this.getMentionOptions.bind(this)
    }))
  }

  deactivate(): void {
    this.context?.resetState()
    this.context = null
  }

  private async getMentionOptions(): Promise<MentionOption[]> {
    if (!this.context) return []

    const terminals = await this.context.getQueryClient().fetchQuery({
      queryKey: ['realtime', 'terminals'],
      queryFn: () => api.terminal.getTerminalsForMention({})
    })

    const terminalMentionOptions: MentionOption[] = terminals.map(terminal => ({
      id: `${PluginId.Terminal}#terminal#${terminal.processId}`,
      type: `${PluginId.Terminal}#terminal`,
      label: terminal.name,
      data: terminal,
      onAddOne: data => {
        this.context?.setState(draft => {
          draft.selectedTerminalsFromEditor.push(data)
        })
      },
      onReplaceAll: dataArr => {
        this.context?.setState(draft => {
          draft.selectedTerminalsFromEditor = dataArr
        })
      },
      searchKeywords: [terminal.name],
      itemLayoutProps: {
        icon: <SquareTerminalIcon className="size-4 mr-1" />,
        label: `${terminal.name} - ${terminal.processId}`,
        details: terminal.commands[0]?.input || 'No commands'
      },
      customRenderPreview: MentionTerminalPreview
    })) satisfies MentionOption<TerminalInfo>[]

    return [
      {
        id: `${PluginId.Terminal}#terminals`,
        type: `${PluginId.Terminal}#terminals`,
        label: 'Terminals',
        topLevelSort: 6,
        searchKeywords: ['terminal', 'shell', 'command'],
        itemLayoutProps: {
          icon: <SquareTerminalIcon className="size-4 mr-1" />,
          label: 'Terminals'
        },
        children: terminalMentionOptions
      }
    ]
  }
}
