import { GlobeIcon } from '@radix-ui/react-icons'
import type { UseMentionOptionsReturns } from '@shared/plugins/base/client/client-plugin-types'
import {
  createClientPlugin,
  type SetupProps
} from '@shared/plugins/base/client/use-client-plugin'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'

import type { WebPluginState } from '../types'
import { WebLogPreview } from './web-log-preview'

export const WebClientPlugin = createClientPlugin<WebPluginState>({
  id: PluginId.Web,
  version: pkg.version,

  getInitialState() {
    return {
      enableWebSearchAgent: false,
      webSearchResultsFromAgent: [],
      webSearchAsDocFromAgent: [],
      enableWebVisitAgent: false,
      webVisitResultsFromAgent: []
    }
  },

  setup(props) {
    const { registerProvider } = props

    registerProvider('useMentionOptions', () => createUseMentionOptions(props))
    registerProvider('CustomRenderLogPreview', () => WebLogPreview)
  }
})

const createUseMentionOptions =
  (props: SetupProps<WebPluginState>) => (): UseMentionOptionsReturns => {
    const { setState } = props

    return [
      {
        id: `${PluginId.Web}#web`,
        type: `${PluginId.Web}#web`,
        label: 'Web',
        data: true,
        onUpdatePluginState: (dataArr: true[]) => {
          setState(draft => {
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
