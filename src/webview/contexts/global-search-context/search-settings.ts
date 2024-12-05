import { settingsConfig, type SettingPage } from '@shared/entities'

import type { SearchResult, SearchSettingItem } from './types'

const getAllSettingsFromSettingsConfig = () => {
  const result: SearchSettingItem[] = []

  // Collect settings from root pages
  const collectSettings = (
    item: SettingPage,
    groupInfo?: { id: string; label: string }
  ) => {
    if (item.settings) {
      result.push(
        ...item.settings.map(setting => ({
          ...setting,
          pageLabel: item.label,
          pageId: item.id,
          groupLabel: groupInfo?.label,
          groupId: groupInfo?.id
        }))
      )
    }
  }

  // Collect from root pages
  settingsConfig.pages?.forEach(page => collectSettings(page))

  // Collect from groups
  settingsConfig.groups?.forEach(group => {
    group.pages?.forEach(page =>
      collectSettings(page, { id: group.id, label: group.label })
    )
  })

  return result
}

export const searchSettings = (query: string): SearchResult[] => {
  const results: SearchResult[] = []
  const searchLower = query.toLowerCase()

  const settingsWithMetadata = getAllSettingsFromSettingsConfig()

  settingsWithMetadata.forEach(setting => {
    if (
      setting.renderOptions.label.toLowerCase().includes(searchLower) ||
      setting.renderOptions.description.toLowerCase().includes(searchLower)
    ) {
      results.push({
        type: 'setting',
        item: setting
      })
    }
  })

  return results
}
