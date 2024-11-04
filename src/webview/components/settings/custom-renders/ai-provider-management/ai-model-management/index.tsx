import { useState } from 'react'
import {
  AIModelEntity,
  AIProviderType,
  type AIModel,
  type AIModelFeature,
  type AIProvider
} from '@shared/entities'
import { removeDuplicates } from '@shared/utils/common'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'
import { cn, logAndToastError } from '@webview/utils/common'
import { toast } from 'sonner'

import { CreateModelDialog } from './create-model-dialog'
import { ManualModelList } from './manual-model-list'
import { RemoteModelList } from './remote-model-list'

const getDefaultAIModel = (
  name: string,
  providerOrBaseUrl: AIProviderType | string
): AIModel =>
  new AIModelEntity({
    name,
    providerOrBaseUrl
  }).entity

export const AIModelManagement = ({
  className,
  provider,
  setProvider
}: {
  className?: string
  provider: AIProvider
  setProvider: (data: AIProvider) => void
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const providerOrBaseUrl =
    provider.type === AIProviderType.Custom
      ? provider.extraFields.customBaseUrl
      : provider.type

  const useRemote = provider.allowRealTimeModels
  const setUseRemote = (value: boolean) => {
    setProvider({
      ...provider,
      allowRealTimeModels: value
    })
  }

  const { data: models = [] } = useQuery({
    queryKey: ['aiModels', providerOrBaseUrl],
    queryFn: () =>
      api.aiModel.getModelsByProviderOrBaseUrl({
        providerOrBaseUrl: providerOrBaseUrl!
      }),
    enabled: !!providerOrBaseUrl
  })

  const updateProviderRemoteModelsMutation = useMutation({
    mutationFn: async () => {
      const remoteModelNames = await api.aiModel.fetchRemoteModelNames({
        provider
      })
      setProvider({
        ...provider,
        realTimeModels: remoteModelNames
      })
    },
    onSuccess: () => {
      toast.success('Provider remote models updated successfully')
    },
    onError: error => {
      logAndToastError('Failed to update provider remote models', error)
    }
  })

  const manualModels = provider.manualModels.map(
    name =>
      models.find(m => m.name === name) ||
      getDefaultAIModel(name, providerOrBaseUrl!)
  )

  const remoteModels = provider.realTimeModels.map(
    name =>
      models.find(m => m.name === name) ||
      getDefaultAIModel(name, providerOrBaseUrl!)
  )

  const updateModelMutation = useMutation({
    mutationFn: (model: AIModel) => api.aiModel.updateModel(model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiModels'] })
    }
  })

  const handleAddModels = (modelNames: string[]) => {
    setProvider({
      ...provider,
      manualModels: removeDuplicates([...provider.manualModels, ...modelNames])
    })
  }

  const handleDeleteModels = (modelNames: string[]) => {
    setProvider({
      ...provider,
      manualModels: provider.manualModels.filter(
        name => !modelNames.includes(name)
      )
    })
  }

  const handleReorderModels = (models: AIModel[]) => {
    setProvider({
      ...provider,
      manualModels: models.map(m => m.name)
    })
  }

  const handleTestModel = async (
    model: AIModel,
    features: AIModelFeature[]
  ) => {
    const result = await api.aiModel.testModel({ model, features })
    updateModelMutation.mutate({
      ...model,
      ...result
    })
  }

  const handleRefreshRemoteModels = () => {
    updateProviderRemoteModelsMutation.mutate()
    toast.success('Refreshing remote models...')
  }

  const handleDeleteModel = (model: AIModel) => {
    setProvider({
      ...provider,
      manualModels: provider.manualModels.filter(name => name !== model.name)
    })
  }

  const handleAddToManual = (model: AIModel) => {
    if (!provider.manualModels.includes(model.name)) {
      setProvider({
        ...provider,
        manualModels: [...provider.manualModels, model.name]
      })
      toast.success(`Added ${model.name} to manual models`)
    } else {
      toast.warning(`${model.name} is already in manual models`)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <CreateModelDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleAddModels}
      />

      <ManualModelList
        models={manualModels}
        onReorderModels={handleReorderModels}
        onDeleteModels={models => {
          handleDeleteModels(models.map(m => m.name))
        }}
        onDeleteModel={handleDeleteModel}
        onCreateModel={() => setIsCreateDialogOpen(true)}
        onTestModels={handleTestModel}
      />

      <RemoteModelList
        models={remoteModels}
        enabled={useRemote}
        onEnabledChange={setUseRemote}
        onRefreshModels={handleRefreshRemoteModels}
        onTestModels={handleTestModel}
        onAddToManual={handleAddToManual}
      />
    </div>
  )
}
