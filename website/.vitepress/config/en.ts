import { createRequire } from 'module'
import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('../../../package.json')

export const en = defineConfig({
  lang: 'en-US',
  description:
    'Conquer Any Code in VSCode: One-Click Comments, Conversions, UI-to-Code, and AI Batch Processing! 💪',
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Nicepkg'
    },
    nav: nav(),
    sidebar: sidebar(),
    editLink: {
      pattern: 'https://github.com/nicepkg/aide/edit/master/website/:path',
      text: 'Edit this page on GitHub'
    }
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: 'Guide',
      link: '/guide/getting-started/',
      activeMatch: '/guide/'
    },
    {
      text: 'Development',
      items: [
        {
          text: 'Install' + ' ' + pkg.version,
          link: 'https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro'
        },
        {
          text: 'Changelog',
          link: 'https://github.com/nicepkg/aide/blob/master/CHANGELOG.md'
        },
        {
          text: 'Contributing',
          link: 'https://github.com/nicepkg/aide/blob/master/CONTRIBUTING.md'
        }
      ]
    }
  ]
}

function sidebar(): DefaultTheme.Sidebar {
  return {
    '/guide/': [
      {
        text: '🚀&nbsp;&nbsp; Getting Started',
        collapsed: false,
        base: '/guide/getting-started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Installation', link: '/installation' },
          {
            text: 'How to Configure OpenAI Key',
            link: '/how-to-configure-openai-key'
          },
          {
            text: 'Customize Shortcuts',
            link: '/customize-shortcuts'
          },
          {
            text: 'Customize Configuration',
            link: '/customize-configuration'
          },
          { text: 'FAQ', link: '/faq' }
        ]
      },
      {
        text: '✨&nbsp;&nbsp; Features',
        collapsed: false,
        base: '/guide/features',
        items: [
          {
            text: 'Code Viewer Helper',
            link: '/code-viewer-helper'
          },
          {
            text: 'Code Convert',
            link: '/code-convert'
          },
          {
            text: 'Smart Paste',
            link: '/smart-paste'
          },
          {
            text: 'AI Batch Processor',
            link: '/batch-processor'
          },
          {
            text: 'Copy Multiple Files As Prompt',
            link: '/copy-as-prompt'
          },
          {
            text: 'Rename Variable',
            link: '/rename-variable'
          },
          { text: 'Ask AI With Custom Command', link: '/ask-ai' }
        ]
      },
      {
        text: '🛠&nbsp;&nbsp; Configuration',
        collapsed: true,
        base: '/guide/configuration',
        items: [
          { text: 'aide.openaiKey', link: '/openai-key' },
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
          { text: 'aide.aiCommand', link: '/ai-command' },
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
        text: '🌱&nbsp;&nbsp; Use Another LLM',
        collapsed: true,
        base: '/guide/use-another-llm',
        items: [
          { text: 'Anthropic', link: '/anthropic' },
          { text: 'Azure', link: '/azure' },
          { text: 'DeepSeek', link: '/deepseek' },
          { text: 'Google', link: '/google' },
          { text: 'IFlytek', link: '/iflytek' },
          { text: 'LocalAI', link: '/local-ai' },
          { text: 'Ollama', link: '/ollama' },
          { text: 'OpenAI', link: '/openai' },
          { text: 'Qwen', link: '/qwen' },
          { text: 'Zhipu', link: '/zhipu' }
        ]
      }
    ]
  }
}
