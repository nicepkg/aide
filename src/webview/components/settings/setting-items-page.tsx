import type { SettingPage, SettingsSaveType } from '@shared/entities'

import { SettingItem } from './setting-item'

export interface SettingItemsPageProps {
  page: SettingPage
  onChange?: (event: {
    key: string
    value: any
    saveType: SettingsSaveType
  }) => Promise<void>
  className?: string
}

export const SettingItemsPage = ({
  page,
  onChange,
  className
}: SettingItemsPageProps) => {
  if (!page?.settings?.length) {
    return null
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {page.settings.map(setting => (
          <SettingItem key={setting.key} config={setting} onChange={onChange} />
        ))}
      </div>
    </div>
  )
}
