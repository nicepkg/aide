import { useEffect, useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { settingsConfig, type SettingsSaveType } from '@shared/entities'
import { Button } from '@webview/components/ui/button'
import { Input } from '@webview/components/ui/input'
import { ScrollArea } from '@webview/components/ui/scroll-area'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@webview/components/ui/tabs'

import { SidebarLayout } from '../sidebar-layout'
import { SettingItemsPage } from './setting-items-page'

export interface SettingsProps {
  onChange?: (event: {
    key: string
    value: any
    saveType: SettingsSaveType
  }) => Promise<void>
  className?: string
  initialPageId?: string | null
}

export const Settings = ({
  onChange,
  className,
  initialPageId
}: SettingsProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPage, setSelectedPage] = useState<string>(
    initialPageId || settingsConfig.pages?.[0]?.id || ''
  )
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(settingsConfig.groups.map(group => [group.id, true]))
  )

  useEffect(() => {
    if (initialPageId) {
      setSelectedPage(initialPageId)

      // If the page is in a group, ensure the group is expanded
      settingsConfig.groups.forEach(group => {
        if (group.pages.some(page => page.id === initialPageId)) {
          setExpandedGroups(prev => ({
            ...prev,
            [group.id]: true
          }))
        }
      })
    }
  }, [initialPageId])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const filterItems = (
    items: (typeof settingsConfig.groups)[number]['pages']
  ) =>
    items.filter(
      item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.settings?.some(
          setting =>
            setting.renderOptions.label
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            setting.renderOptions.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
    )

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
          {/* Render standalone pages */}
          {settingsConfig.pages &&
            filterItems(settingsConfig.pages).map(page => (
              <Button
                key={page.id}
                variant={selectedPage === page.id ? 'secondary' : 'ghost'}
                className="w-full justify-start px-2"
                onClick={() => setSelectedPage(page.id)}
              >
                {page.label}
              </Button>
            ))}

          {/* Render groups */}
          {settingsConfig.groups.map(group => (
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
                  {filterItems(group.pages).map(page => (
                    <Button
                      key={page.id}
                      variant={selectedPage === page.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start pl-4"
                      onClick={() => setSelectedPage(page.id)}
                    >
                      {page.label}
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
    <Tabs value={selectedPage} className="flex-1">
      <TabsList className="hidden">
        {/* Include standalone pages */}
        {settingsConfig.pages?.map(page => (
          <TabsTrigger key={page.id} value={page.id}>
            {page.label}
          </TabsTrigger>
        ))}
        {/* Include group pages */}
        {settingsConfig.groups.flatMap(group =>
          group.pages.map(page => (
            <TabsTrigger key={page.id} value={page.id}>
              {page.label}
            </TabsTrigger>
          ))
        )}
      </TabsList>

      {/* Render standalone page content */}
      {settingsConfig.pages?.map(page => (
        <TabsContent
          key={page.id}
          value={page.id}
          className="flex-1 p-4 overflow-auto"
        >
          <SettingItemsPage page={page} onChange={onChange} />
        </TabsContent>
      ))}

      {/* Render group page content */}
      {settingsConfig.groups.flatMap(group =>
        group.pages.map(page => (
          <TabsContent
            key={page.id}
            value={page.id}
            className="flex-1 p-4 overflow-auto"
          >
            <SettingItemsPage page={page} onChange={onChange} />
          </TabsContent>
        ))
      )}
    </Tabs>
  )

  return (
    <SidebarLayout title="Settings" sidebar={sidebar()} className={className}>
      {content}
    </SidebarLayout>
  )
}
