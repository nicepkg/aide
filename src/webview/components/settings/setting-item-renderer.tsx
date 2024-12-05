import { useState } from 'react'
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import type { SettingConfigItem } from '@shared/entities'
import { Button } from '@webview/components/ui/button'
import { Input } from '@webview/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@webview/components/ui/select'
import { Switch } from '@webview/components/ui/switch'
import { Textarea } from '@webview/components/ui/textarea'

import { AIProviderManagement } from './custom-renders/ai-provider-management'
import { CodebaseIndexing } from './custom-renders/codebase'
import { DocManagement } from './custom-renders/doc-management'

interface SettingItemRendererProps {
  value: any
  onChange: (value: any) => void
  disabled?: boolean
  config: SettingConfigItem
}

export const SettingItemRenderer = ({
  value,
  onChange,
  disabled,
  config
}: SettingItemRendererProps) => {
  const [showSecret, setShowSecret] = useState(false)

  const val = value ?? config.renderOptions.defaultValue
  const inputProps = {
    disabled,
    value: val,
    onChange: (e: any) => onChange(e.target.value),
    placeholder: config.renderOptions.placeholder ?? '',
    className: 'text-sm'
  }

  switch (config.renderOptions.type) {
    case 'input':
      return (
        <div className="flex gap-2">
          <Input type={showSecret ? 'text' : 'password'} {...inputProps} />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setShowSecret(!showSecret)}
          >
            {showSecret ? (
              <EyeOpenIcon className="h-4 w-4" />
            ) : (
              <EyeClosedIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      )

    case 'textarea':
      return <Textarea {...inputProps} />

    case 'switch':
      return (
        <Switch checked={val} onCheckedChange={onChange} disabled={disabled} />
      )

    case 'numberInput':
      return (
        <Input
          type="number"
          {...inputProps}
          onChange={e => onChange(Number(e.target.value))}
        />
      )

    case 'selectInput':
      return (
        <Select value={val} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {config.renderOptions.options?.map(option => {
              const { label, value } =
                typeof option === 'string'
                  ? { label: option, value: option }
                  : option
              return (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      )

    case 'arrayInput':
    case 'objectInput':
      return (
        <Button
          variant="outline"
          onClick={() => onChange(config.renderOptions.defaultValue)}
          disabled={disabled}
        >
          Edit {config.renderOptions.type === 'arrayInput' ? 'Array' : 'Object'}
        </Button>
      )

    case 'codebaseIndexing':
      return <CodebaseIndexing />

    case 'docManagement':
      return <DocManagement />

    case 'modelManagement':
      return <AIProviderManagement />

    default:
      return null
  }
}
