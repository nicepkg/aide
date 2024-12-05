import { IdCardIcon } from '@radix-ui/react-icons'
import type {
  ClientPlugin,
  ClientPluginContext
} from '@shared/plugins/base/client/client-plugin-context'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'
import { api } from '@webview/services/api-client'
import { type MentionOption } from '@webview/types/chat'

import type { DocPluginState } from '../types'
import { DocLogPreview } from './doc-log-preview'

export class DocClientPlugin implements ClientPlugin<DocPluginState> {
  id = PluginId.Doc

  version: string = pkg.version

  private context: ClientPluginContext<DocPluginState> | null = null

  getInitState() {
    return {
      allowSearchDocSiteNamesFromEditor: [],
      relevantDocsFromAgent: []
    }
  }

  async activate(context: ClientPluginContext<DocPluginState>): Promise<void> {
    this.context = context

    this.context.registerProvider('state', () => this.context!.state)
    this.context.registerProvider('editor', () => ({
      getMentionOptions: this.getMentionOptions.bind(this)
    }))

    this.context.registerProvider('message', () => ({
      customRenderLogPreview: DocLogPreview
    }))
  }

  deactivate(): void {
    this.context?.resetState()
    this.context = null
  }

  private async getMentionOptions(): Promise<MentionOption[]> {
    if (!this.context) return []

    const queryClient = this?.context?.getQueryClient?.()

    if (!queryClient) return []

    const docSites = await queryClient.fetchQuery({
      queryKey: ['realtime', 'docSites'],
      queryFn: () => api.doc.getDocSites({})
    })

    const docSiteNamesMentionOptions: MentionOption[] = docSites.map(
      site =>
        ({
          id: `${PluginId.Doc}#doc#${site.id}`,
          type: `${PluginId.Doc}#doc`,
          label: site.name,
          data: site.name,
          onAddOne: data => {
            this.context?.setState(draft => {
              draft.allowSearchDocSiteNamesFromEditor.push(data)
            })
          },
          onReplaceAll: dataArr => {
            this.context?.setState(draft => {
              draft.allowSearchDocSiteNamesFromEditor = dataArr
            })
          },

          searchKeywords: [site.name, site.url],
          itemLayoutProps: {
            icon: <IdCardIcon className="size-4 mr-1" />,
            label: site.name,
            details: site.url
          }
        }) satisfies MentionOption<string>
    )

    return [
      {
        id: `${PluginId.Doc}#docs`,
        type: `${PluginId.Doc}#docs`,
        label: 'Docs',
        topLevelSort: 4,
        searchKeywords: ['docs'],
        itemLayoutProps: {
          icon: <IdCardIcon className="size-4 mr-1" />,
          label: 'Docs'
        },
        children: docSiteNamesMentionOptions
      }
    ]
  }
}
