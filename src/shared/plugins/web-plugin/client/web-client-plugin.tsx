import { GlobeIcon } from '@radix-ui/react-icons'
import type {
  ClientPlugin,
  ClientPluginContext
} from '@shared/plugins/base/client/client-plugin-context'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'
import { type MentionOption } from '@webview/types/chat'

import type { WebPluginState } from '../types'
import { WebLogPreview } from './web-log-preview'

export class WebClientPlugin implements ClientPlugin<WebPluginState> {
  id = PluginId.Web

  version: string = pkg.version

  private context: ClientPluginContext<WebPluginState> | null = null

  getInitState() {
    return {
      enableWebSearchAgent: false,
      webSearchResultsFromAgent: [],
      webSearchAsDocFromAgent: [],
      enableWebVisitAgent: false,
      webVisitResultsFromAgent: []
    }
  }

  async activate(context: ClientPluginContext<WebPluginState>): Promise<void> {
    this.context = context

    this.context.registerProvider('state', () => this.context!.state)
    this.context.registerProvider('editor', () => ({
      getMentionOptions: this.getMentionOptions.bind(this)
    }))
    this.context.registerProvider('message', () => ({
      customRenderLogPreview: WebLogPreview
    }))
  }

  deactivate(): void {
    this.context?.resetState()
    this.context = null
  }

  private async getMentionOptions(): Promise<MentionOption[]> {
    if (!this.context) return []

    return [
      {
        id: `${PluginId.Web}#web`,
        type: `${PluginId.Web}#web`,
        label: 'Web',
        data: true,
        onAddOne: () => {
          this.context?.setState(draft => {
            draft.enableWebVisitAgent = true
            draft.enableWebSearchAgent = true
          })
        },
        onReplaceAll: (dataArr: true[]) => {
          this.context?.setState(draft => {
            draft.enableWebVisitAgent = dataArr.length > 0
            draft.enableWebSearchAgent = dataArr.length > 0
          })
        },
        topLevelSort: 3,
        searchKeywords: ['web', 'search'],
        itemLayoutProps: {
          icon: <GlobeIcon className="size-4 mr-1" />,
          label: 'Web'
        }
      }
    ]
  }
}
