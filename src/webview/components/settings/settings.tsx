import { useState, type FC } from 'react'
import { Button } from '@webview/components/ui/button'
import { Input } from '@webview/components/ui/input'
import { ScrollArea } from '@webview/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@webview/components/ui/select'
import { Switch } from '@webview/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@webview/components/ui/tabs'

import { SidebarLayout } from '../sidebar-layout'

export interface SettingItem {
  key: string
  label: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'custom'
  options?: string[]
  defaultValue?: any
  customRenderer?: () => React.ReactNode
}

export interface SettingCategory {
  id: string
  label: string
  settings?: SettingItem[]
  customRenderer?: () => React.ReactNode
}

export interface SettingsConfig {
  title: string
  categories: SettingCategory[]
}

export interface SettingsProps {
  config: SettingsConfig
  onChange: (key: string, value: any) => void
  className?: string
}

export const Settings: FC<SettingsProps> = ({
  config,
  onChange,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(
    config.categories[0]?.id || ''
  )

  const filteredCategories = config.categories.filter(
    category =>
      category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.settings?.some(
        setting =>
          setting.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          setting.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  const renderSettingInput = (setting: SettingItem) => {
    switch (setting.type) {
      case 'string':
        return (
          <Input
            defaultValue={setting.defaultValue}
            onChange={e => onChange(setting.key, e.target.value)}
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            defaultValue={setting.defaultValue}
            onChange={e => onChange(setting.key, parseFloat(e.target.value))}
          />
        )
      case 'boolean':
        return (
          <Switch
            defaultChecked={setting.defaultValue}
            onCheckedChange={checked => onChange(setting.key, checked)}
          />
        )
      case 'select':
        return (
          <Select
            defaultValue={setting.defaultValue}
            onValueChange={value => onChange(setting.key, value)}
          >
            <SelectTrigger>
              <SelectValue>{setting.defaultValue}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'custom':
        return setting.customRenderer?.()
      default:
        return null
    }
  }

  const sidebar = () => (
    <div>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search settings..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
      </div>
      <div>
        <ScrollArea className="h-[calc(100vh-150px)] mt-2">
          <div className="space-y-1 py-2">
            {filteredCategories.map(category => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? 'secondary' : 'ghost'
                }
                className="w-full justify-start"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  const content = (
    <Tabs value={selectedCategory} className="flex-1">
      <TabsList className="hidden">
        {config.categories.map(category => (
          <TabsTrigger key={category.id} value={category.id}>
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {config.categories.map(category => (
        <TabsContent
          key={category.id}
          value={category.id}
          className="flex-1 p-4 overflow-auto"
        >
          <div className="space-y-6">
            {category.settings?.map(setting => (
              <div key={setting.key} className="flex flex-col space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {setting.label}
                </label>
                {renderSettingInput(setting)}
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
            ))}
            {category.customRenderer?.()}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )

  return (
    <SidebarLayout
      title={config.title}
      sidebar={sidebar()}
      className={className}
    >
      {content}
    </SidebarLayout>
  )
}
