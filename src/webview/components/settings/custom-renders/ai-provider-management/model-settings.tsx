import { CaretSortIcon } from '@radix-ui/react-icons'
import {
  FeatureModelSettingKey,
  modelSettingKeyTitleMap
} from '@shared/entities'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import { ModelSelector } from '@webview/components/chat/selectors/model-selector'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@webview/components/ui/accordion'
import { cn } from '@webview/utils/common'

interface ModelSettingItemProps {
  settingKey: FeatureModelSettingKey
  title?: string
  className?: string
}

export const ModelSettingItem = ({
  settingKey,
  title,
  className
}: ModelSettingItemProps) => (
  <div className={cn('flex flex-col space-y-2', className)}>
    {title && (
      <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {title}
      </span>
    )}
    <ModelSelector
      featureModelSettingKey={settingKey}
      renderTrigger={({ tooltip, title }) => (
        <ButtonWithTooltip
          tooltip={tooltip}
          variant="outline"
          size="xs"
          className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:border focus:border-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        >
          {title}
          <CaretSortIcon className="h-4 w-4 opacity-50" />
        </ButtonWithTooltip>
      )}
    />
  </div>
)

interface ModelSettingsProps {
  // Keys that should always be visible outside the accordion
  pinnedKeys?: FeatureModelSettingKey[]
  className?: string
}

export const ModelSettings = ({
  pinnedKeys = [FeatureModelSettingKey.Default],
  className
}: ModelSettingsProps) => {
  const allSettings = Object.entries(modelSettingKeyTitleMap) as [
    FeatureModelSettingKey,
    string
  ][]
  const pinnedSettings = allSettings.filter(([key]) => pinnedKeys.includes(key))
  const collapsedSettings = allSettings.filter(
    ([key]) => !pinnedKeys.includes(key)
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* Pinned settings that are always visible */}
      {pinnedSettings.map(([key, title]) => (
        <ModelSettingItem key={key} settingKey={key} title={title} />
      ))}

      {/* Collapsible settings */}
      {collapsedSettings.length > 0 && (
        <div className="border rounded-md px-3">
          <Accordion type="single" collapsible>
            <AccordionItem value="model-settings" className="border-b-0">
              <AccordionTrigger className="hover:no-underline p-0 h-9">
                Other Model Settings
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {collapsedSettings.map(([key, title]) => (
                    <ModelSettingItem
                      key={key}
                      settingKey={key}
                      title={title}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  )
}
