import { createRequire } from 'module'
import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('../../../package.json')

export const zh = defineConfig({
  lang: 'zh-Hans',
  description: '在 VSCode 里掌握任何屎山代码：一键注释和语言转换。💪',
  themeConfig: {
    footer: {
      message: '基于 MIT 许可发布',
      copyright: `Copyright © 2024-present Nicepkg`
    },
    nav: nav(),
    sidebar: sidebar(),
    editLink: {
      pattern: 'https://github.com/nicepkg/aide/edit/master/website/:path',
      text: '在 GitHub 上编辑此页面'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    outline: {
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: '指南',
      link: '/zh/guide/getting-started/',
      activeMatch: '/zh/guide/'
    },
    {
      text: '开发',
      items: [
        {
          text: '安装' + ' ' + pkg.version,
          link: 'https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro'
        },
        {
          text: '更新日志',
          link: 'https://github.com/nicepkg/aide/blob/master/CHANGELOG.md'
        },
        {
          text: '贡献指南',
          link: 'https://github.com/nicepkg/aide/blob/master/CONTRIBUTING.md'
        }
      ]
    }
  ]
}

function sidebar(): DefaultTheme.Sidebar {
  return {
    '/zh/guide/': [
      {
        text: '🚀&nbsp;&nbsp; 快速开始',
        collapsed: false,
        base: '/zh/guide/getting-started',
        items: [
          { text: '简介', link: '/' },
          {
            text: '安装',
            link: '/installation'
          },
          {
            text: '如何配置 OpenAI Key',
            link: '/how-to-configure-openai-key'
          },
          {
            text: '自定义快捷键',
            link: '/customize-shortcuts'
          },
          {
            text: '自定义配置',
            link: '/customize-configuration'
          },
          { text: '常见问题解答', link: '/faq' },
          { text: '社区', link: '/community' }
        ]
      },
      {
        text: '✨&nbsp;&nbsp; 功能',
        collapsed: false,
        base: '/zh/guide/features',
        items: [
          {
            text: '智能代码查看器助手',
            link: '/code-viewer-helper'
          },
          {
            text: '智能代码转换',
            link: '/code-convert'
          },
          {
            text: '让大师帮你改代码',
            link: '/expert-code-enhancer'
          },
          {
            text: '智能粘贴',
            link: '/smart-paste'
          },
          {
            text: 'AI 批量处理文件',
            link: '/batch-processor'
          },
          {
            text: '批量复制文件为 AI 提示词',
            link: '/copy-as-prompt'
          },
          {
            text: '智能重命名变量',
            link: '/rename-variable'
          },
          {
            text: '自定义命令提问 AI',
            link: '/ask-ai'
          }
        ]
      },
      {
        text: '🛠&nbsp;&nbsp; 配置',
        collapsed: true,
        base: '/zh/guide/configuration',
        items: [
          {
            text: 'aide.openaiKey',
            link: '/openai-key'
          },
          {
            text: 'aide.openaiModel',
            link: '/openai-model'
          },
          {
            text: 'aide.openaiBaseUrl',
            link: '/openai-base-url'
          },
          {
            text: 'aide.apiConcurrency',
            link: '/api-concurrency'
          },
          {
            text: 'aide.useSystemProxy',
            link: '/use-system-proxy'
          },
          {
            text: 'aide.codeViewerHelperPrompt',
            link: '/code-viewer-helper-prompt'
          },
          {
            text: 'aide.convertLanguagePairs',
            link: '/convert-language-pairs'
          },
          {
            text: 'aide.autoRememberConvertLanguagePairs',
            link: '/auto-remember-convert-language-pairs'
          },
          {
            text: 'aide.expertCodeEnhancerPromptList',
            link: '/expert-code-enhancer-prompt-list'
          },
          {
            text: 'aide.readClipboardImage',
            link: '/read-clipboard-image'
          },
          { text: 'aide.aiPrompt', link: '/ai-prompt' },
          {
            text: 'aide.ignorePatterns',
            link: '/ignore-patterns'
          },
          {
            text: 'aide.respectGitIgnore',
            link: '/respect-git-ignore'
          },
          {
            text: 'aide.aiCommand',
            link: '/ai-command'
          },
          {
            text: 'aide.aiCommandCopyBeforeRun',
            link: '/ai-command-copy-before-run'
          },
          {
            text: 'aide.aiCommandAutoRun',
            link: '/ai-command-auto-run'
          }
        ]
      },
      {
        text: '🌱&nbsp;&nbsp; 使用其他大语言模型',
        collapsed: true,
        base: '/zh/guide/use-another-llm',
        items: [
          { text: 'Aide 模型聚合(便宜)', link: '/aide-models' },
          { text: 'Anthropic', link: '/anthropic' },
          { text: 'Azure', link: '/azure' },
          { text: 'DeepSeek', link: '/deepseek' },
          { text: '谷歌', link: '/google' },
          { text: '讯飞', link: '/iflytek' },
          { text: 'LocalAI', link: '/local-ai' },
          { text: 'MiniMax', link: '/minimax' },
          { text: 'Ollama', link: '/ollama' },
          { text: 'OpenAI', link: '/openai' },
          { text: '通义千问', link: '/qwen' },
          { text: '智谱', link: '/zhipu' }
        ]
      }
    ]
  }
}

export const search: DefaultTheme.AlgoliaSearchOptions['locales'] = {
  zh: {
    placeholder: '搜索文档',
    translations: {
      button: {
        buttonText: '搜索文档',
        buttonAriaLabel: '搜索文档'
      },
      modal: {
        searchBox: {
          resetButtonTitle: '清除查询条件',
          resetButtonAriaLabel: '清除查询条件',
          cancelButtonText: '取消',
          cancelButtonAriaLabel: '取消'
        },
        startScreen: {
          recentSearchesTitle: '搜索历史',
          noRecentSearchesText: '没有搜索历史',
          saveRecentSearchButtonTitle: '保存至搜索历史',
          removeRecentSearchButtonTitle: '从搜索历史中移除',
          favoriteSearchesTitle: '收藏',
          removeFavoriteSearchButtonTitle: '从收藏中移除'
        },
        errorScreen: {
          titleText: '无法获取结果',
          helpText: '你可能需要检查你的网络连接'
        },
        footer: {
          selectText: '选择',
          navigateText: '切换',
          closeText: '关闭',
          searchByText: '搜索提供者'
        },
        noResultsScreen: {
          noResultsText: '无法找到相关结果',
          suggestedQueryText: '你可以尝试查询',
          reportMissingResultsText: '你认为该查询应该有结果？',
          reportMissingResultsLinkText: '点击反馈'
        }
      }
    }
  }
}
