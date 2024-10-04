import { CodebaseIndexing } from './custom-renders/codebase'
import { DocManagement } from './custom-renders/doc-management'
import type { SettingsConfig } from './settings'

export const settingsConfig: SettingsConfig = {
  title: 'Settings',
  categories: [
    {
      id: 'general',
      label: 'General',
      settings: [
        {
          key: 'openaiKey',
          label: 'OpenAI Key',
          description:
            "OpenAI Key, click to view online documentation or I Don't Have an OpenAI Key",
          type: 'string',
          defaultValue: ''
        },
        {
          key: 'openaiModel',
          label: 'OpenAI Model',
          description: 'OpenAI Model, click to view online documentation',
          type: 'select',
          options: ['claude-3.5-sonnet', 'gpt-4'],
          defaultValue: 'claude-3.5-sonnet'
        },
        {
          key: 'openaiBaseUrl',
          label: 'OpenAI Base URL',
          description: 'OpenAI Base URL, click to view online documentation',
          type: 'string',
          defaultValue: ''
        },
        {
          key: 'apiConcurrency',
          label: 'API Concurrency',
          description:
            'API request concurrency, click to view online documentation',
          type: 'number',
          defaultValue: 3
        },
        {
          key: 'useSystemProxy',
          label: 'Use System Proxy',
          description:
            'Use global proxy (HTTP_PROXY, HTTPS_PROXY, ALL_PROXY), you need to restart VSCode to take effect after changing this setting, click to view online documentation',
          type: 'boolean',
          defaultValue: false
        },
        {
          key: 'ignorePatterns',
          label: 'Ignore Patterns',
          description:
            'Ignored file name patterns, supports glob syntax, click to view online documentation',
          type: 'string',
          defaultValue: ''
        },
        {
          key: 'respectGitIgnore',
          label: 'Respect .gitignore',
          description:
            'Respect .gitignore file, click to view online documentation',
          type: 'boolean',
          defaultValue: true
        }
      ]
    },
    {
      id: 'chat',
      label: 'Chat',
      settings: [
        {
          key: 'codebase',
          label: 'Codebase Indexing',
          description: 'Codebase indexing, click to view online documentation',
          type: 'custom',
          customRenderer: () => <CodebaseIndexing />
        }
      ]
    },
    {
      id: 'askAI',
      label: 'Ask AI',
      settings: [
        {
          key: 'aiCommand',
          label: 'AI Command Template',
          description:
            'Custom ✨ Aide: Ask AI command template. Available variables: #{filesRelativePath}, #{filesFullPath}, #{content}, click to view online documentation',
          type: 'string',
          defaultValue: ''
        },
        {
          key: 'aiCommandCopyBeforeRun',
          label: 'Copy AI Command Before Run',
          description:
            'Copy AI command to clipboard before ✨ Aide: Ask AI running, click to view online documentation',
          type: 'boolean',
          defaultValue: false
        },
        {
          key: 'aiCommandAutoRun',
          label: 'Auto Run AI Command',
          description:
            'Automatically run AI command when clicking ✨ Aide: Ask AI, click to view online documentation',
          type: 'boolean',
          defaultValue: false
        }
      ]
    },
    {
      id: 'copyAsPrompt',
      label: 'Copy As Prompt',
      settings: [
        {
          key: 'aiPrompt',
          label: 'AI Prompt Template',
          description:
            'Template for copied content, use #{content} as a variable for file content, click to view online documentation',
          type: 'string',
          defaultValue: ''
        }
      ]
    },
    {
      id: 'codeConvert',
      label: 'Code Convert',
      settings: [
        {
          key: 'convertLanguagePairs',
          label: 'Convert Language Pairs',
          description:
            'Default convert language pairs, click to view online documentation',
          type: 'string',
          defaultValue: ''
        },
        {
          key: 'autoRememberConvertLanguagePairs',
          label: 'Auto Remember Convert Language Pairs',
          description:
            'Automatically remember convert language pairs, click to view online documentation',
          type: 'boolean',
          defaultValue: true
        }
      ]
    },
    {
      id: 'codeViewerHelper',
      label: 'Code Viewer Helper',
      settings: [
        {
          key: 'codeViewerHelperPrompt',
          label: 'Code Viewer Helper Prompt',
          description:
            'Code viewer helper AI prompt template, click to view online documentation',
          type: 'string',
          defaultValue: ''
        }
      ]
    },
    {
      id: 'expertCodeEnhancer',
      label: 'Expert Code Enhancer',
      settings: [
        {
          key: 'expertCodeEnhancerPromptList',
          label: 'Expert Code Enhancer Prompt List',
          description:
            'Expert code enhancer AI prompt template list, click to view online documentation',
          type: 'string',
          defaultValue: ''
        }
      ]
    },
    {
      id: 'smartPaste',
      label: 'Smart Paste',
      settings: [
        {
          key: 'readClipboardImage',
          label: 'Read Clipboard Image',
          description:
            'Allow reading clipboard images as AI context in certain scenarios, click to view online documentation',
          type: 'boolean',
          defaultValue: false
        }
      ]
    },
    {
      id: 'batchProcessor',
      label: 'Batch Processor',
      settings: []
    },
    {
      id: 'docManagement',
      label: 'Doc Management',
      settings: [
        {
          key: 'docManagement',
          label: 'Manage Documentation Sites',
          description:
            'Add, remove, and manage documentation sites for indexing',
          type: 'custom',
          customRenderer: () => <DocManagement />
        }
      ]
    }
  ]
}
