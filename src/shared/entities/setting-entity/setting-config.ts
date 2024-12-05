import type { ValueUnion } from '@shared/types/common'

import * as settingItemsConfig from './setting-items-config'
import {
  aiCommandAutoRunConfig,
  aiCommandConfig,
  aiCommandCopyBeforeRunConfig,
  aiPromptConfig,
  apiConcurrencyConfig,
  autoRememberConvertLanguagePairsConfig,
  codeViewerHelperPromptConfig,
  convertLanguagePairsConfig,
  docManagementConfig,
  expertCodeEnhancerPromptListConfig,
  ignorePatternsConfig,
  modelsConfig,
  openaiBaseUrlConfig,
  openaiKeyConfig,
  openaiModelConfig,
  readClipboardImageConfig,
  respectGitIgnoreConfig,
  useSystemProxyConfig
} from './setting-items-config'
import type { SettingConfig, SettingConfigItem } from './types'

// Setting groups and pages configuration
export const settingsConfig: SettingConfig = {
  pages: [
    {
      id: 'general',
      label: 'General',
      settings: [
        openaiKeyConfig,
        openaiModelConfig,
        openaiBaseUrlConfig,
        apiConcurrencyConfig,
        useSystemProxyConfig,
        ignorePatternsConfig,
        respectGitIgnoreConfig
      ]
    }
  ],
  groups: [
    {
      id: 'chat',
      label: 'Chat',
      pages: [
        {
          id: 'chatModel',
          label: 'AI Models',
          settings: [modelsConfig]
        },
        {
          id: 'chatDoc',
          label: 'Doc Sites Indexing',
          settings: [docManagementConfig]
        }
      ]
    },
    {
      id: 'tools',
      label: 'Tools',
      pages: [
        {
          id: 'copyAsPrompt',
          label: 'Copy As Prompt',
          settings: [aiPromptConfig]
        },
        {
          id: 'codeConvert',
          label: 'Code Convert',
          settings: [
            convertLanguagePairsConfig,
            autoRememberConvertLanguagePairsConfig
          ]
        },
        {
          id: 'codeViewerHelper',
          label: 'Code Viewer Helper',
          settings: [codeViewerHelperPromptConfig]
        },
        {
          id: 'expertCodeEnhancer',
          label: 'Expert Code Enhancer',
          settings: [expertCodeEnhancerPromptListConfig]
        },
        {
          id: 'smartPaste',
          label: 'Smart Paste',
          settings: [readClipboardImageConfig]
        },
        {
          id: 'askAI',
          label: 'Ask AI',
          settings: [
            aiCommandConfig,
            aiCommandCopyBeforeRunConfig,
            aiCommandAutoRunConfig
          ]
        }
      ]
    }
  ]
}

type SettingItemsConfig = typeof settingItemsConfig
export type SettingKey = ValueUnion<SettingItemsConfig>['key']

type SettingItemConfigFromKey<K extends SettingKey> = SettingConfigItem<
  Extract<ValueUnion<SettingItemsConfig>, { key: K }>['renderOptions']['type']
>

export type SettingValue<K extends SettingKey> =
  SettingItemConfigFromKey<K>['renderOptions']['defaultValue']

export const settingKeyItemConfigMap = Object.values(settingItemsConfig).reduce(
  (acc, item) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    acc[item.key] = item
    return acc
  },
  {} as {
    [K in SettingKey]: SettingItemConfigFromKey<K>
  }
)
