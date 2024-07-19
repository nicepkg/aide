import DefaultTheme from 'vitepress/theme'
import type { App } from 'vue'

import Video from '../../components/Video.vue'

import 'uno.css'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.component('Video', Video)
  }
}
