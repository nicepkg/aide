import { useEffect, useState, type FC } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import type { SettingsSaveType } from '@shared/utils/settings-config'
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
import { cn, logAndToastError } from '@webview/utils/common'
import { logger } from '@webview/utils/logger'

import { SidebarLayout } from '../sidebar-layout'
import type { SettingCategory, SettingItem, SettingsConfig } from './types'

export interface SettingsProps {
  config: SettingsConfig
  onChange?: (key: string, value: any) => void
  onRemoteChange?: (
    key: string,
    value: any,
    saveType: SettingsSaveType
  ) => Promise<void>
  className?: string
  initialCategory?: string
}

export const Settings: FC<SettingsProps> = ({
  config,
  onChange,
  onRemoteChange,
  className,
  initialCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || config.categories[0]?.id || '' // Use initialCategory if provided
  )
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(config.groups.map(group => [group.id, true]))
  )
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory)

      // If the category is in a group, ensure the group is expanded
      config.groups.forEach(group => {
        if (group.categories.some(cat => cat.id === initialCategory)) {
          setExpandedGroups(prev => ({
            ...prev,
            [group.id]: true
          }))
        }
      })
    }
  }, [initialCategory, config.groups])

  const handleSettingChange = async (setting: SettingItem, value: any) => {
    logger.log(`Setting ${setting.key} changed to:`, value)
    onChange?.(setting.key, value)

    if (onRemoteChange) {
      setLoading(prev => ({ ...prev, [setting.key]: true }))
      try {
        await onRemoteChange(setting.key, value, setting.saveType)
      } catch (error) {
        logAndToastError('Failed to save setting', error)
      } finally {
        setLoading(prev => ({ ...prev, [setting.key]: false }))
      }
    }
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const filterItems = (items: SettingCategory[]) =>
    items.filter(
      item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.settings?.some(
          setting =>
            setting.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            setting.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

  const renderSettingInput = (setting: SettingItem) => {
    const isLoading = loading[setting.key]

    const renderInput = () => {
      switch (setting.type) {
        case 'string':
          return (
            <Input
              defaultValue={setting.defaultValue}
              onChange={e => handleSettingChange(setting, e.target.value)}
            />
          )
        case 'number':
          return (
            <Input
              type="number"
              defaultValue={setting.defaultValue}
              onChange={e =>
                handleSettingChange(setting, parseFloat(e.target.value))
              }
            />
          )
        case 'boolean':
          return (
            <Switch
              defaultChecked={setting.defaultValue}
              onCheckedChange={checked => handleSettingChange(setting, checked)}
            />
          )
        case 'select':
          return (
            <Select
              defaultValue={setting.defaultValue}
              onValueChange={value => handleSettingChange(setting, value)}
            >
              <SelectTrigger>
                <SelectValue>{setting.defaultValue}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {setting.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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

    return (
      <div
        className={cn(
          'relative',
          isLoading && 'opacity-50 pointer-events-none'
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        {renderInput()}
      </div>
    )
  }

  const sidebar = () => (
    <div>
      <div className="space-y-1">
        <Input
          placeholder="Search settings..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="h-8"
        />
      </div>
      <ScrollArea className="h-[calc(100vh-150px)] mt-2">
        <div className="space-y-1 py-2">
          {/* Render standalone categories */}
          {filterItems(config.categories).map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'secondary' : 'ghost'}
              className="w-full justify-start px-2"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}

          {/* Render groups */}
          {config.groups.map(group => (
            <div key={group.id} className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-between px-2"
                onClick={() => toggleGroup(group.id)}
              >
                <span>{group.label}</span>
                {expandedGroups[group.id] ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </Button>
              {expandedGroups[group.id] && (
                <div className="ml-4 space-y-1">
                  {filterItems(group.categories).map(category => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? 'secondary' : 'ghost'
                      }
                      className="w-full justify-start pl-4"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  const content = (
    <Tabs value={selectedCategory} className="flex-1">
      <TabsList className="hidden">
        {/* Include standalone categories */}
        {config.categories.map(category => (
          <TabsTrigger key={category.id} value={category.id}>
            {category.label}
          </TabsTrigger>
        ))}
        {/* Include group categories */}
        {config.groups.flatMap(group =>
          group.categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))
        )}
      </TabsList>

      {/* Render standalone category content */}
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

      {/* Render group category content */}
      {config.groups.flatMap(group =>
        group.categories.map(category => (
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
        ))
      )}
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
