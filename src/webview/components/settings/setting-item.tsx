import type {
  SettingConfigItem,
  SettingKey,
  SettingsSaveType
} from '@shared/entities'
import { useSettings } from '@webview/hooks/api/use-settings'
import { cn } from '@webview/utils/common'

import { SettingItemRenderer } from './setting-item-renderer'

export interface SettingItemProps {
  config: SettingConfigItem
  value?: any
  onChange?: (event: {
    key: string
    value: any
    saveType: SettingsSaveType
  }) => Promise<void>
  className?: string
}

export const SettingItem = ({
  config,
  value,
  onChange,
  className
}: SettingItemProps) => {
  const { getSetting, setSetting, loadingMap } = useSettings({
    autoToastOnSuccess: false
  })
  const loading = loadingMap[config.key as SettingKey]

  const handleChange = async (newValue: any) => {
    setSetting(config.key, newValue)
    onChange?.({ key: config.key, value: newValue, saveType: config.saveType })
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium leading-none">
          {config.renderOptions.label}
        </label>
        {loading && (
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        )}
      </div>
      <SettingItemRenderer
        value={value ?? getSetting(config.key as SettingKey)}
        onChange={handleChange}
        disabled={loading}
        config={config}
      />
      <p className="text-sm text-muted-foreground">
        {config.renderOptions.description}
      </p>
    </div>
  )
}
