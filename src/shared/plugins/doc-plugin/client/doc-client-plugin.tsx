import { GearIcon, IdCardIcon } from '@radix-ui/react-icons'
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
import { useNavigate } from 'react-router'

import type { DocPluginState } from '../types'
import { DocLogPreview } from './doc-log-preview'

export const DocClientPlugin = createClientPlugin<DocPluginState>({
  id: PluginId.Doc,
  version: pkg.version,

  getInitialState() {
    return {
      allowSearchDocSiteNamesFromEditor: [],
      relevantDocsFromAgent: []
    }
  },

  setup(props) {
    const { registerProvider } = props

    registerProvider('useMentionOptions', () => createUseMentionOptions(props))
    registerProvider('CustomRenderLogPreview', () => DocLogPreview)
  }
})

const createUseMentionOptions =
  (props: SetupProps<DocPluginState>) => (): UseMentionOptionsReturns => {
    const { setState } = props
    const navigate = useNavigate()

    const { data: docSites = [] } = useQuery({
      queryKey: ['realtime', 'docSites'],
      queryFn: () => api.doc.getDocSites({})
    })

    const docSiteNamesSettingMentionOption: MentionOption<string> = {
      id: `${PluginId.Doc}#doc#setting`,
      type: `${PluginId.Doc}#doc`,
      label: 'docs setting',
      disableAddToEditor: true,
      onSelect: () => {
        navigate(`/settings?pageId=chatDoc`)
      },
      searchKeywords: ['setting', 'docsetting'],
      itemLayoutProps: {
        icon: <GearIcon className="size-4 mr-1" />,
        label: 'Docs setting',
        details: ''
      }
    }

    const docSiteNamesMentionOptions: MentionOption[] = docSites.map(
      site =>
        ({
          id: `${PluginId.Doc}#doc#${site.id}`,
          type: `${PluginId.Doc}#doc`,
          label: site.name,
          data: site.name,
          onUpdatePluginState: dataArr => {
            setState(draft => {
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
        children: [
          docSiteNamesSettingMentionOption,
          ...docSiteNamesMentionOptions
        ]
      }
    ]
  }
