import { SettingItem } from '@webview/components/settings/setting-item'

import type { SearchSettingItem } from '../types'

export const SettingPreview: React.FC<{ setting: SearchSettingItem }> = ({
  setting
}) => <SettingItem key={setting.key} config={setting} />
