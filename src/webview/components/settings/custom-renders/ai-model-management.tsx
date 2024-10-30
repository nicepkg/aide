import { useEffect, useState } from 'react'
import {
  DragHandleDots2Icon,
  EyeClosedIcon,
  EyeOpenIcon,
  Pencil2Icon,
  PlusIcon,
  TrashIcon
} from '@radix-ui/react-icons'
import {
  AI_PROVIDER_CONFIGS,
  AIProviderType,
  type AIModelProvider
} from '@shared/utils/ai-providers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@webview/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@webview/components/ui/dialog'
import { Input } from '@webview/components/ui/input'
import { Label } from '@webview/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@webview/components/ui/select'
import { api } from '@webview/services/api-client'
import { logAndToastError } from '@webview/utils/common'
import { Reorder } from 'framer-motion'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const AIModelManagement = () => {
  const queryClient = useQueryClient()
  const [editingProvider, setEditingProvider] =
    useState<AIModelProvider | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const providerQueryKey = ['aiProviders']
  const { data: providers = [] } = useQuery({
    queryKey: providerQueryKey,
    queryFn: () => api.aiProvider.getProviders({})
  })

  const addProviderMutation = useMutation({
    mutationFn: (data: Omit<AIModelProvider, 'id'>) =>
      api.aiProvider.addProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKey })
      toast.success('New provider added successfully')
      handleCloseDialog()
    },
    onError: error => {
      logAndToastError('Failed to save provider', error)
    }
  })

  const updateProviderMutation = useMutation({
    mutationFn: (data: AIModelProvider) => api.aiProvider.updateProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKey })
      toast.success('Provider updated successfully')
      handleCloseDialog()
    },
    onError: error => {
      logAndToastError('Failed to save provider', error)
    }
  })

  const removeProviderMutation = useMutation({
    mutationFn: (id: string) => api.aiProvider.removeProvider({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKey })
      toast.success('Provider removed successfully')
    },
    onError: error => {
      logAndToastError('Failed to remove provider', error)
    }
  })

  const reorderProvidersMutation = useMutation({
    mutationFn: (updates: Array<{ id: string; order: number }>) =>
      api.aiProvider.updateProviders(updates),
    onError: error => {
      logAndToastError('Failed to update provider order', error)
      queryClient.invalidateQueries({ queryKey: providerQueryKey })
    }
  })

  const handleSubmit = async (data: Partial<AIModelProvider>) => {
    const order = providers.length + 1
    if (editingProvider) {
      updateProviderMutation.mutate({
        ...data,
        order,
        id: editingProvider.id
      } as AIModelProvider)
    } else {
      addProviderMutation.mutate({ ...data, order } as Omit<
        AIModelProvider,
        'id'
      >)
    }
  }

  const handleEditProvider = (provider: AIModelProvider) => {
    setEditingProvider(provider)
    setIsDialogOpen(true)
  }

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProvider(null)
  }

  const handleReorder = async (reorderedItems: AIModelProvider[]) => {
    queryClient.setQueryData(providerQueryKey, reorderedItems)

    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      order: index + 1
    }))

    reorderProvidersMutation.mutate(updates)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Dialog
          open={isDialogOpen}
          onOpenChange={val => {
            if (val) {
              handleOpenDialog()
            } else {
              handleCloseDialog()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="text-sm" size="sm">
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Models
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-2rem)] rounded-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProvider ? 'Edit Models' : 'Add New Models'}
              </DialogTitle>
            </DialogHeader>
            <ProviderForm
              editingProvider={editingProvider}
              onSubmit={handleSubmit}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Reorder.Group
        axis="y"
        values={providers}
        onReorder={handleReorder}
        className="grid grid-cols-1 gap-3"
      >
        {providers.map(provider => (
          <Reorder.Item
            key={provider.id}
            value={provider}
            className="cursor-grab active:cursor-grabbing"
          >
            <ProviderCard
              provider={provider}
              onEdit={handleEditProvider}
              onRemove={id => removeProviderMutation.mutate(id)}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  )
}

const getDefaultExtraFields = (type: AIProviderType) => {
  const config = AI_PROVIDER_CONFIGS[type]
  if (!config) return {}
  return config.fields.reduce(
    (acc, field) => {
      if (field.defaultValue) {
        acc[field.key] = field.defaultValue
      }
      return acc
    },
    {} as Record<string, string>
  )
}

const ProviderCard = ({
  provider,
  onEdit,
  onRemove
}: {
  provider: AIModelProvider
  onEdit: (provider: AIModelProvider) => void
  onRemove: (id: string) => void
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
          <DragHandleDots2Icon className="h-4 w-4 text-muted-foreground" />
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
          <Button
            variant="ghost"
            onClick={() => onRemove(provider.id)}
            size="sm"
            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        {Object.entries({
          type: AI_PROVIDER_CONFIGS[provider.type]?.name,
          ...provider.extraFields
        }).map(([key, value]) => {
          let fieldConfig = AI_PROVIDER_CONFIGS[provider.type]?.fields.find(
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

const ProviderForm = ({
  editingProvider,
  onSubmit,
  onClose
}: {
  editingProvider: AIModelProvider | null
  onSubmit: (data: Partial<AIModelProvider>) => Promise<void>
  onClose: () => void
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

  const { control, handleSubmit, reset, setValue, watch } = useForm<
    Partial<AIModelProvider>
  >({
    defaultValues: {
      type: AIProviderType.OpenAI,
      extraFields: getDefaultExtraFields(AIProviderType.OpenAI)
    }
  })

  const type = watch('type')
  useEffect(() => {
    setValue('extraFields', getDefaultExtraFields(type as AIProviderType))
  }, [type, setValue])

  const handleFormSubmit = async (data: Partial<AIModelProvider>) => {
    await onSubmit(data)
    reset()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Provider Type</Label>
        <Controller
          name="type"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Select
              value={value}
              onValueChange={val => {
                onChange(val)
                setValue(
                  'extraFields',
                  getDefaultExtraFields(val as AIProviderType)
                )
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AI_PROVIDER_CONFIGS).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Provider Name</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} className="text-sm" />}
        />
      </div>

      {AI_PROVIDER_CONFIGS[type!]?.fields.map(field => (
        <div key={field.key} className="space-y-2">
          <Label className="text-xs">{field.label}</Label>
          <Controller
            name={`extraFields.${field.key}`}
            control={control}
            defaultValue={field.defaultValue || ''}
            render={({ field: { onChange, value } }) => (
              <div className="flex items-center space-x-2">
                <Input
                  value={value || ''}
                  onChange={onChange}
                  className="text-sm"
                  disabled={field.disabled}
                  type={
                    field.isSecret && !visibleFields[field.key]
                      ? 'password'
                      : 'text'
                  }
                />
                {field.isSecret && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => toggleFieldVisibility(field.key)}
                  >
                    {visibleFields[field.key] ? (
                      <EyeOpenIcon className="h-4 w-4" />
                    ) : (
                      <EyeClosedIcon className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            )}
          />
        </div>
      ))}
      <Button type="submit" className="w-full text-sm">
        {editingProvider ? 'Update Provider' : 'Add Provider'}
      </Button>
    </form>
  )
}
