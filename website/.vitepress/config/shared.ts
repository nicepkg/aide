import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'
import Mark from 'markdown-it-mark'
import Unocss from 'unocss/vite'
import { defineConfig } from 'vitepress'

import { bilibiliSvg } from './svg'
import { search as zhSearch } from './zh'

export const shared = defineConfig({
  title: 'Aide',

  rewrites: {
    'en/:rest*': ':rest*'
  },

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  markdown: {
    lineNumbers: false,
    config(md) {
      md.use(InlineLinkPreviewElementTransform)
      md.use(Mark)
    }
  },

  sitemap: {
    hostname: 'https://aide.nicepkg.cn',
    transformItems(items) {
      return items.filter(item => !item.url.includes('migration'))
    }
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-mini.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/logo-mini.png' }],
    ['meta', { name: 'theme-color', content: '#8c6bef' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    [
      'meta',
      {
        property: 'og:title',
        content: 'Aide | Conquer Any Code in VSCode'
      }
    ],
    ['meta', { property: 'og:site_name', content: 'Aide' }],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://aide.nicepkg.cn/og-cover.png'
      }
    ],
    ['meta', { property: 'og:url', content: 'https://aide.nicepkg.cn/' }]
  ],

  themeConfig: {
    logo: { src: '/logo-mini.svg', width: 24, height: 24 },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nicepkg/aide' },
      {
        icon: 'twitter',
        link: 'https://x.com/jinmingyang666'
      },
      {
        icon: 'youtube',
        link: 'https://www.youtube.com/@jinmingyang666'
      },
      {
        icon: {
          svg: bilibiliSvg
        },
        link: 'https://space.bilibili.com/83540912'
      }
    ],

    // search: {
    //   provider: 'algolia',
    //   options: {
    //     appId: 'xxx',
    //     apiKey: 'xxx',
    //     indexName: 'aide',
    //     locales: {
    //       ...zhSearch
    //     }
    //   }
    // }

    search: {
      provider: 'local'
    }
  },

  vite: {
    plugins: [
      Unocss({
        configFile: '../../uno.config.ts'
      })
    ],
    optimizeDeps: {
      exclude: ['@nolebase/vitepress-plugin-inline-link-preview/markdown-it']
    },
    ssr: {
      noExternal: ['@nolebase/*']
    }
  }
})
