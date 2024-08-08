import { NolebaseInlineLinkPreviewPlugin } from '@nolebase/vitepress-plugin-inline-link-preview/client'
import DefaultTheme from 'vitepress/theme'
import type { App } from 'vue'

import '@nolebase/vitepress-plugin-inline-link-preview/client/style.css'

import AideModelPrice from '../../components/AideModels/AideModelPrice/index.vue'
import AidePay from '../../components/AideModels/AidePay.vue'
import Video from '../../components/Video.vue'

import 'virtual:uno.css'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.component('Video', Video)
    app.component('AidePay', AidePay)
    app.component('AideModelPrice', AideModelPrice)
    app.use(NolebaseInlineLinkPreviewPlugin)
  }
}
