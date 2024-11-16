import { v4 as uuidv4 } from 'uuid'

import { BaseEntity, type IBaseEntity } from './base-entity'

export interface Settings extends IBaseEntity {
  key: SettingKey
  value: SettingValue<SettingKey>
  category: SettingCategory
  updatedAt: number
}

export class SettingsEntity extends BaseEntity<Settings> {
  protected getDefaults(data?: Partial<Settings>): Settings {
    return {
      id: uuidv4(),
      key: 'unknown' as SettingKey,
      value: 'unknown',
      category: 'appearance' as SettingCategory,
      updatedAt: Date.now(),
      ...data
    }
  }
}

export type SettingsSaveType = 'global' | 'workspace'
export type SettingsOption = string | { label: string; value: string }

export interface SettingsConfigItem {
  saveType: SettingsSaveType
  label: string
  description: string
  type: 'string' | 'boolean' | 'number' | 'array' | 'object' | 'select'
  options?: SettingsOption[]
  defaultValue: any
  category: string
  isCustomRender?: boolean
}

export const settingsConfig = {
  // General Settings
  models: {
    saveType: 'global',
    label: 'Models',
    description: 'Models',
    type: 'object',
    defaultValue: {},
    category: 'general',
    isCustomRender: true
  },
  openaiKey: {
    saveType: 'global',
    label: 'OpenAI Key',
    description:
      "OpenAI Key, click to view online documentation or I Don't Have an OpenAI Key",
    type: 'string',
    defaultValue: '',
    category: 'general'
  },
  openaiModel: {
    saveType: 'global',
    label: 'OpenAI Model',
    description: 'OpenAI Model, click to view online documentation',
    type: 'select',
    options: ['claude-3.5-sonnet', 'gpt-4'],
    defaultValue: 'claude-3.5-sonnet',
    category: 'general'
  },
  openaiBaseUrl: {
    saveType: 'global',
    label: 'OpenAI Base URL',
    description: 'OpenAI Base URL, click to view online documentation',
    type: 'string',
    defaultValue: 'https://api.openai.com/v1',
    category: 'general'
  },
  apiConcurrency: {
    saveType: 'global',
    label: 'API Concurrency',
    description: 'API request concurrency, click to view online documentation',
    type: 'number',
    defaultValue: 3,
    category: 'general'
  },
  useSystemProxy: {
    saveType: 'global',
    label: 'Use System Proxy',
    description:
      'Use global proxy (HTTP_PROXY, HTTPS_PROXY, ALL_PROXY), you need to restart VSCode to take effect after changing this setting',
    type: 'boolean',
    defaultValue: false,
    category: 'general'
  },

  // File Settings
  ignorePatterns: {
    saveType: 'workspace',
    label: 'Ignore Patterns',
    description: 'Ignored file name patterns, supports glob syntax',
    type: 'array',
    defaultValue: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**'
    ],
    category: 'general'
  },
  respectGitIgnore: {
    saveType: 'workspace',
    label: 'Respect .gitignore',
    description: 'Respect .gitignore file',
    type: 'boolean',
    defaultValue: true,
    category: 'general'
  },

  // Tools Settings
  aiPrompt: {
    saveType: 'global',
    label: 'AI Prompt Template',
    description:
      'Template for copied content, use #{content} as a variable for file content',
    type: 'string',
    defaultValue: '#{content}',
    category: 'copyAsPrompt'
  },
  convertLanguagePairs: {
    saveType: 'workspace',
    label: 'Convert Language Pairs',
    description: 'Default convert language pairs',
    type: 'object',
    defaultValue: {},
    category: 'codeConvert'
  },
  autoRememberConvertLanguagePairs: {
    saveType: 'global',
    label: 'Auto Remember Convert Language Pairs',
    description: 'Automatically remember convert language pairs',
    type: 'boolean',
    defaultValue: true,
    category: 'codeConvert'
  },
  codeViewerHelperPrompt: {
    saveType: 'global',
    label: 'Code Viewer Helper Prompt',
    description: 'Code viewer helper AI prompt template',
    type: 'string',
    defaultValue: '',
    category: 'codeViewerHelper'
  },
  expertCodeEnhancerPromptList: {
    saveType: 'global',
    label: 'Expert Code Enhancer Prompt List',
    description: 'Expert code enhancer AI prompt template list',
    type: 'array',
    defaultValue: [],
    category: 'expertCodeEnhancer'
  },
  readClipboardImage: {
    saveType: 'global',
    label: 'Read Clipboard Image',
    description:
      'Allow reading clipboard images as AI context in certain scenarios',
    type: 'boolean',
    defaultValue: false,
    category: 'smartPaste'
  },

  // AI Command Settings
  aiCommand: {
    saveType: 'global',
    label: 'AI Command Template',
    description:
      'Custom ✨ Aide: Ask AI command template. Available variables: #{filesRelativePath}, #{filesFullPath}, #{content}',
    type: 'string',
    defaultValue: '',
    category: 'askAI'
  },
  aiCommandCopyBeforeRun: {
    saveType: 'global',
    label: 'Copy AI Command Before Run',
    description: 'Copy AI command to clipboard before ✨ Aide: Ask AI running',
    type: 'boolean',
    defaultValue: false,
    category: 'askAI'
  },
  aiCommandAutoRun: {
    saveType: 'global',
    label: 'Auto Run AI Command',
    description: 'Automatically run AI command when clicking ✨ Aide: Ask AI',
    type: 'boolean',
    defaultValue: false,
    category: 'askAI'
  }
} as const satisfies Record<string, SettingsConfigItem>

// Type helpers
type SettingValueType = {
  string: string
  boolean: boolean
  number: number
  array: any[]
  object: Record<string, any>
  select: string
}

export type SettingKey = keyof typeof settingsConfig
export type SettingCategory = (typeof settingsConfig)[SettingKey]['category']
export type SettingValue<K extends SettingKey> =
  SettingValueType[(typeof settingsConfig)[K]['type']]
