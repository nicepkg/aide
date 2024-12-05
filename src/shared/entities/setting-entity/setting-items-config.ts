import type { SettingConfigItem } from './types'

// General settings
export const openaiKeyConfig = {
  key: 'openaiKey',
  saveType: 'global',
  renderOptions: {
    type: 'input',
    label: 'OpenAI Key',
    description:
      "OpenAI Key, click to view online documentation or I Don't Have an OpenAI Key",
    placeholder: 'Enter your OpenAI Key',
    defaultValue: ''
  }
} as const satisfies SettingConfigItem<'input'>

export const openaiModelConfig = {
  key: 'openaiModel',
  saveType: 'global',
  renderOptions: {
    type: 'selectInput',
    label: 'OpenAI Model',
    description: 'OpenAI Model, click to view online documentation',
    options: ['claude-3.5-sonnet', 'gpt-4'],
    defaultValue: 'claude-3.5-sonnet'
  }
} as const satisfies SettingConfigItem<'selectInput'>

export const openaiBaseUrlConfig = {
  key: 'openaiBaseUrl',
  saveType: 'global',
  renderOptions: {
    type: 'input',
    label: 'OpenAI Base URL',
    description: 'OpenAI Base URL, click to view online documentation',
    defaultValue: 'https://api.openai.com/v1'
  }
} as const satisfies SettingConfigItem<'input'>

export const apiConcurrencyConfig = {
  key: 'apiConcurrency',
  saveType: 'global',
  renderOptions: {
    type: 'numberInput',
    label: 'API Concurrency',
    description: 'API request concurrency, click to view online documentation',
    defaultValue: 3
  }
} as const satisfies SettingConfigItem<'numberInput'>

export const useSystemProxyConfig = {
  key: 'useSystemProxy',
  saveType: 'global',
  renderOptions: {
    type: 'switch',
    label: 'Use System Proxy',
    description:
      'Use global proxy (HTTP_PROXY, HTTPS_PROXY, ALL_PROXY), you need to restart VSCode to take effect after changing this setting',
    defaultValue: false
  }
} as const satisfies SettingConfigItem<'switch'>

export const ignorePatternsConfig = {
  key: 'ignorePatterns',
  saveType: 'workspace',
  renderOptions: {
    type: 'arrayInput',
    label: 'Ignore Patterns',
    description: 'Ignored file name patterns, supports glob syntax',
    defaultValue: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**'
    ]
  }
} as const satisfies SettingConfigItem<'arrayInput'>

export const respectGitIgnoreConfig = {
  key: 'respectGitIgnore',
  saveType: 'workspace',
  renderOptions: {
    type: 'switch',
    label: 'Respect .gitignore',
    description: 'Respect .gitignore file',
    defaultValue: true
  }
} as const satisfies SettingConfigItem<'switch'>

// Chat settings
export const modelsConfig = {
  key: 'models',
  saveType: 'global',
  renderOptions: {
    type: 'modelManagement',
    label: 'Models',
    description: 'Models',
    defaultValue: {}
  }
} as const satisfies SettingConfigItem<'modelManagement'>

export const docManagementConfig = {
  key: 'docManagement',
  saveType: 'global',
  renderOptions: {
    type: 'docManagement',
    label: 'Doc Sites Indexing',
    description: 'Doc Sites Indexing',
    defaultValue: {}
  }
} as const satisfies SettingConfigItem<'docManagement'>

// Tool settings
export const aiPromptConfig = {
  key: 'aiPrompt',
  saveType: 'global',
  renderOptions: {
    type: 'textarea',
    label: 'AI Prompt Template',
    description:
      'Template for copied content, use #{content} as a variable for file content',
    defaultValue: '#{content}'
  }
} as const satisfies SettingConfigItem<'textarea'>

export const convertLanguagePairsConfig = {
  key: 'convertLanguagePairs',
  saveType: 'workspace',
  renderOptions: {
    type: 'objectInput',
    label: 'Convert Language Pairs',
    description: 'Default convert language pairs',
    defaultValue: {}
  }
} as const satisfies SettingConfigItem<'objectInput'>

export const autoRememberConvertLanguagePairsConfig = {
  key: 'autoRememberConvertLanguagePairs',
  saveType: 'global',
  renderOptions: {
    type: 'switch',
    label: 'Auto Remember Convert Language Pairs',
    description: 'Automatically remember convert language pairs',
    defaultValue: true
  }
} as const satisfies SettingConfigItem<'switch'>

export const codeViewerHelperPromptConfig = {
  key: 'codeViewerHelperPrompt',
  saveType: 'global',
  renderOptions: {
    type: 'textarea',
    label: 'Code Viewer Helper Prompt',
    description: 'Code viewer helper AI prompt template',
    defaultValue: ''
  }
} as const satisfies SettingConfigItem<'textarea'>

export const expertCodeEnhancerPromptListConfig = {
  key: 'expertCodeEnhancerPromptList',
  saveType: 'global',
  renderOptions: {
    type: 'arrayInput',
    label: 'Expert Code Enhancer Prompt List',
    description: 'Expert code enhancer AI prompt template list',
    defaultValue: []
  }
} as const satisfies SettingConfigItem<'arrayInput'>

export const readClipboardImageConfig = {
  key: 'readClipboardImage',
  saveType: 'global',
  renderOptions: {
    type: 'switch',
    label: 'Read Clipboard Image',
    description:
      'Allow reading clipboard images as AI context in certain scenarios',
    defaultValue: false
  }
} as const satisfies SettingConfigItem<'switch'>

export const aiCommandConfig = {
  key: 'aiCommand',
  saveType: 'global',
  renderOptions: {
    type: 'textarea',
    label: 'AI Command Template',
    description:
      'Custom ✨ Aide: Ask AI command template. Available variables: #{filesRelativePath}, #{filesFullPath}, #{content}',
    defaultValue: ''
  }
} as const satisfies SettingConfigItem<'textarea'>

export const aiCommandCopyBeforeRunConfig = {
  key: 'aiCommandCopyBeforeRun',
  saveType: 'global',
  renderOptions: {
    type: 'switch',
    label: 'Copy AI Command Before Run',
    description: 'Copy AI command to clipboard before ✨ Aide: Ask AI running',
    defaultValue: false
  }
} as const satisfies SettingConfigItem<'switch'>

export const aiCommandAutoRunConfig = {
  key: 'aiCommandAutoRun',
  saveType: 'global',
  renderOptions: {
    type: 'switch',
    label: 'Auto Run AI Command',
    description: 'Automatically run AI command when clicking ✨ Aide: Ask AI',
    defaultValue: false
  }
} as const satisfies SettingConfigItem<'switch'>
