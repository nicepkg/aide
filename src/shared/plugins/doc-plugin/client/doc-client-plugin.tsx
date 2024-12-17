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

import { DocMentionType, type DocPluginState } from '../types'
import { DocLogPreview } from './doc-log-preview'

export const DocClientPlugin = createClientPlugin<DocPluginState>({
  id: PluginId.Doc,
  version: pkg.version,

  getInitialState() {
    return {}
  },

  setup(props) {
    const { registerProvider } = props

    registerProvider('useMentionOptions', () => createUseMentionOptions(props))
    registerProvider('CustomRenderLogPreview', () => DocLogPreview)
  }
})

const createUseMentionOptions =
  (props: SetupProps<DocPluginState>) => (): UseMentionOptionsReturns => {
    const navigate = useNavigate()

    const { data: docSites = [] } = useQuery({
      queryKey: ['realtime', 'docSites'],
      queryFn: () => api.doc.getDocSites({})
    })

    const docSiteNamesSettingMentionOption: MentionOption = {
      id: DocMentionType.DocSetting,
      type: DocMentionType.DocSetting,
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

    const docSiteNamesMentionOptions: MentionOption<string>[] = docSites.map(
      site =>
        ({
          id: `${DocMentionType.Doc}#${site.id}`,
          type: DocMentionType.Doc,
          label: site.name,
          data: site.name,
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
        id: DocMentionType.Docs,
        type: DocMentionType.Docs,
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
