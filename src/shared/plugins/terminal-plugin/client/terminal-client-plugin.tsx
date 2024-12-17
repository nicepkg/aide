import type { UseMentionOptionsReturns } from '@shared/plugins/base/client/client-plugin-types'
import {
  createClientPlugin,
  type SetupProps
} from '@shared/plugins/base/client/use-client-plugin'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'
import { useQuery } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'
import { type MentionOption } from '@webview/types/chat'
import { SquareTerminalIcon } from 'lucide-react'

import {
  TerminalInfo,
  TerminalMentionType,
  TerminalPluginState
} from '../types'
import { MentionTerminalPreview } from './mention-terminal-preview'

export const TerminalClientPlugin = createClientPlugin<TerminalPluginState>({
  id: PluginId.Terminal,
  version: pkg.version,

  getInitialState() {
    return {}
  },

  setup(props) {
    const { registerProvider } = props

    registerProvider('useMentionOptions', () => createUseMentionOptions(props))
  }
})

const createUseMentionOptions =
  (props: SetupProps<TerminalPluginState>) => (): UseMentionOptionsReturns => {
    const { data: terminals = [] } = useQuery({
      queryKey: ['realtime', 'terminals'],
      queryFn: () => api.terminal.getTerminalsForMention({})
    })

    const terminalMentionOptions: MentionOption[] = terminals.map(terminal => ({
      id: `${TerminalMentionType.Terminal}#${terminal.processId}`,
      type: TerminalMentionType.Terminal,
      label: terminal.name,
      data: terminal,
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
        id: TerminalMentionType.Terminals,
        type: TerminalMentionType.Terminals,
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
