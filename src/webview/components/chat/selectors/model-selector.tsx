import React, { useState } from 'react'
import { GearIcon, Pencil2Icon, PlusIcon } from '@radix-ui/react-icons'
import {
  AIProviderType,
  type AIModel,
  type AIProvider,
  type FeatureModelSettingKey,
  type FeatureModelSettingValue
} from '@shared/entities'
import { removeDuplicates } from '@shared/utils/common'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import {
  IndexList,
  type IndexListCategoryProps,
  type IndexListProps
} from '@webview/components/index-list'
import { QueryStateWrapper } from '@webview/components/query-state-wrapper'
import { ProviderDialog } from '@webview/components/settings/custom-renders/ai-provider-management/provider-dialog'
import { providerQueryKey } from '@webview/components/settings/custom-renders/ai-provider-management/utils'
import { Button } from '@webview/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@webview/components/ui/popover'
import { useControllableState } from '@webview/hooks/use-controllable-state'
import { api } from '@webview/services/api-client'
import { cn } from '@webview/utils/common'
import { useNavigate } from 'react-router-dom'

interface ModelSelectorProps {
  featureModelSettingKey: FeatureModelSettingKey
  open?: boolean
  onOpenChange?: (open: boolean) => void
  renderTrigger: (props: {
    activeProvider?: AIProvider
    activeModel?: AIModel
  }) => React.ReactNode
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  featureModelSettingKey,
  open,
  onOpenChange,
  renderTrigger
}) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange
  })
  const queryClient = useQueryClient()
  const [editingProvider, setEditingProvider] = useState<
    AIProvider | undefined
  >()
  const [isAddingProvider, setIsAddingProvider] = useState(false)

  const { data: featureModelSetting, isLoading: isLoadingFeatureModelSetting } =
    useQuery({
      queryKey: ['featureModelSetting', featureModelSettingKey],
      queryFn: () =>
        api.aiModel.getProviderAndModelForFeature({
          key: featureModelSettingKey
        }),
      refetchOnMount: true
    })

  const updateFeatureModelSettingMutation = useMutation({
    mutationFn: (req: {
      key: FeatureModelSettingKey
      value: FeatureModelSettingValue
    }) => api.aiModel.setModelSettingForFeature(req),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['featureModelSetting', featureModelSettingKey]
      })
    }
  })

  const { data: providers = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ['aiProviders'],
    queryFn: () => api.aiProvider.getProviders({}),
    refetchOnMount: true
  })

  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ['aiModels'],
    queryFn: () => api.aiModel.getModels({}),
    refetchOnMount: true
  })

  const isLoading =
    isLoadingFeatureModelSetting || isLoadingProviders || isLoadingModels

  const providerOrBaseUrlModelsMap = models.reduce<Record<string, AIModel[]>>(
    (acc, model) => {
      acc[model.providerOrBaseUrl] = acc[model.providerOrBaseUrl] || []
      acc[model.providerOrBaseUrl]?.push(model)
      return acc
    },
    {}
  )

  const providerIdModelsMap = providers.reduce<Record<string, AIModel[]>>(
    (acc, provider) => {
      const providerTypeOrBaseUrl =
        provider.type === AIProviderType.Custom
          ? provider.extraFields.customBaseUrl
          : provider.type

      if (!providerTypeOrBaseUrl) return acc

      const modelNames = removeDuplicates([
        ...provider.manualModels,
        ...provider.realTimeModels
      ])

      acc[provider.id] = (
        providerOrBaseUrlModelsMap[providerTypeOrBaseUrl] || []
      ).filter(model => modelNames.includes(model.name))
      return acc
    },
    {}
  )

  // Transform data for IndexList
  const categories: IndexListProps['categories'] = providers.map(provider => ({
    id: provider.id,
    label: provider.name
  }))

  const items: IndexListProps['items'] = providers
    .map(
      provider =>
        providerIdModelsMap[provider.id]?.map(model => ({
          id: model.id,
          categoryId: provider.id,
          content: <div>{model.name}</div>
        })) ?? []
    )
    .flat()

  const renderCustomCategory = ({
    category,
    isSelected,
    onSelect
  }: IndexListCategoryProps) => {
    const provider = providers.find(p => p.id === category.id)
    if (!provider) return null

    return (
      <div
        onClick={onSelect}
        className={cn(
          'cursor-pointer flex items-center justify-between w-full rounded-md px-2 py-1.5 text-sm transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isSelected
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground'
        )}
      >
        {category.label}

        <Button
          variant="ghost"
          size="iconXs"
          className="shrink-0 ml-1 hover:bg-primary hover:text-primary-foreground"
          onClick={e => {
            e.stopPropagation()
            setEditingProvider(provider)
          }}
        >
          <Pencil2Icon className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  const handleAddProvider = async (data: Partial<AIProvider>) => {
    const order = providers.length + 1
    await api.aiProvider.addProvider({ ...data, order } as Omit<
      AIProvider,
      'id'
    >)
    setIsAddingProvider(false)
    queryClient.invalidateQueries({ queryKey: providerQueryKey })
  }

  const handleOpenProvidersManagement = () => {
    navigate(`/settings?category=chatModel`)
  }

  const renderSidebarFooter = () => (
    <div className="flex items-center gap-2">
      <ButtonWithTooltip
        size="iconXs"
        variant="outline"
        onClick={() => setIsAddingProvider(true)}
        tooltip="Add new provider"
      >
        <PlusIcon className="size-4" />
      </ButtonWithTooltip>

      <ButtonWithTooltip
        size="iconXs"
        variant="outline"
        onClick={handleOpenProvidersManagement}
        tooltip="Manage providers"
      >
        <GearIcon className="size-4" />
      </ButtonWithTooltip>
    </div>
  )

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {renderTrigger({
            activeProvider: featureModelSetting?.provider,
            activeModel: featureModelSetting?.model
          })}
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-2rem)] max-w-[400px] p-0"
          updatePositionStrategy="optimized"
          side="bottom"
          align="start"
          withBlur
        >
          <QueryStateWrapper
            isLoading={isLoading}
            isEmpty={!providers.length || !models.length}
            emptyMessage="No AI models available"
          >
            <IndexList
              selectedCategoryId={featureModelSetting?.provider?.id}
              selectedItemId={featureModelSetting?.model?.id}
              categories={categories}
              items={items}
              className="h-[400px]"
              contentClassName="pl-2"
              renderCategory={renderCustomCategory}
              sidebarFooter={renderSidebarFooter()}
              onSelectItem={item => {
                updateFeatureModelSettingMutation.mutate({
                  key: featureModelSettingKey,
                  value: {
                    providerId: item.categoryId,
                    modelName: models.find(m => m.id === item.id)?.name || ''
                  }
                })
              }}
            />
          </QueryStateWrapper>
        </PopoverContent>
      </Popover>

      <ProviderDialog
        open={!!editingProvider}
        onOpenChange={open => !open && setEditingProvider(undefined)}
        provider={editingProvider}
        onSubmit={async data => {
          await api.aiProvider.updateProvider(data as AIProvider)
          setEditingProvider(undefined)
          queryClient.invalidateQueries({ queryKey: providerQueryKey })
        }}
      />

      <ProviderDialog
        open={isAddingProvider}
        onOpenChange={setIsAddingProvider}
        onSubmit={handleAddProvider}
      />
    </>
  )
}
