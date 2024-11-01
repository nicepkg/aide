import { useState } from 'react'
import {
  DragHandleDots2Icon,
  EyeClosedIcon,
  EyeOpenIcon,
  Pencil2Icon,
  TrashIcon
} from '@radix-ui/react-icons'
import { aiProviderConfigs, type AIProvider } from '@shared/utils/ai-providers'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@webview/components/ui/alert-dialog'
import { Button } from '@webview/components/ui/button'

export const ProviderCard = ({
  provider,
  onEdit,
  onRemove,
  dragHandleProps
}: {
  provider: AIProvider
  onEdit: (provider: AIProvider) => void
  onRemove: (id: string) => void
  dragHandleProps?: any
}) => {
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    {}
  )

  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }))
  }

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing"
          >
            <DragHandleDots2Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-primary">{provider.name}</h3>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            onClick={() => onEdit(provider)}
            size="sm"
            className="h-7 w-7 p-0 hover:bg-muted"
          >
            <Pencil2Icon className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <TrashIcon className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  provider.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRemove(provider.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        {Object.entries({
          type: aiProviderConfigs[provider.type]?.name,
          ...provider.extraFields
        }).map(([key, value]) => {
          let fieldConfig = aiProviderConfigs[provider.type]?.fields.find(
            f => f.key === key
          )

          if (key === 'type' && !fieldConfig) {
            fieldConfig = {
              key: 'type',
              label: 'Provider Type',
              isSecret: false,
              required: true
            }
          }

          if (!fieldConfig) return null

          return (
            <div key={key}>
              <div className="text-xs font-medium opacity-50">
                {fieldConfig.label}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 font-mono text-xs break-all">
                  {fieldConfig.isSecret && !visibleFields[key]
                    ? '*'.repeat(12)
                    : value}
                </div>
                {fieldConfig.isSecret && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => toggleFieldVisibility(key)}
                  >
                    {visibleFields[key] ? (
                      <EyeOpenIcon className="h-3.5 w-3.5" />
                    ) : (
                      <EyeClosedIcon className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
