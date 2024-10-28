import { settingsConfig } from '@webview/components/settings/settings-config'

import type { SearchResult } from './types'

export const searchSettings = (query: string): SearchResult[] => {
  const results: SearchResult[] = []
  const searchLower = query.toLowerCase()

  // Search in standalone categories
  settingsConfig.categories.forEach(category => {
    category.settings?.forEach(setting => {
      if (
        setting.label.toLowerCase().includes(searchLower) ||
        setting.description.toLowerCase().includes(searchLower)
      ) {
        results.push({
          type: 'setting',
          item: setting,
          metadata: {
            categoryName: category.label,
            categoryId: category.id
          }
        })
      }
    })
  })

  // Search in group categories
  settingsConfig.groups.forEach(group => {
    group.categories.forEach(category => {
      category.settings?.forEach(setting => {
        if (
          setting.label.toLowerCase().includes(searchLower) ||
          setting.description.toLowerCase().includes(searchLower)
        ) {
          results.push({
            type: 'setting',
            item: setting,
            metadata: {
              groupName: group.label,
              categoryName: category.label,
              categoryId: category.id
            }
          })
        }
      })
    })
  })

  return results
}
