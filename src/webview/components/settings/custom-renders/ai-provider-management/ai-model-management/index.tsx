import { useState } from 'react'
import {
  AIProviderType,
  type AIModel,
  type AIModelFeature,
  type AIProvider
} from '@shared/utils/ai-providers'
import { removeDuplicates } from '@shared/utils/common'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'
import { toast } from 'sonner'

import { CreateModelDialog } from './create-model-dialog'
import { ManualModelList } from './manual-model-list'
import { RemoteModelList } from './remote-model-list'

export const AIModelManagement = ({
  provider,
  setProvider
}: {
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

  const { data: remoteModels = [], refetch: refetchRemoteModels } = useQuery({
    queryKey: ['remoteModels', provider],
    queryFn: () => api.aiModel.fetchRemoteModels({ provider }),
    enabled: useRemote
  })

  const updateModelMutation = useMutation({
    mutationFn: (model: AIModel) => api.aiModel.updateModel(model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiModels'] })
    }
  })

  const addModelMutation = useMutation({
    mutationFn: (model: Omit<AIModel, 'id'>) => api.aiModel.addModel(model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiModels'] })
    }
  })

  const handleAddModels = (modelNames: string[]) => {
    if (!providerOrBaseUrl) {
      toast.error('Provider or base URL is not set')
      return
    }

    modelNames.forEach(name => {
      addModelMutation.mutate({
        name,
        providerOrBaseUrl,
        imageSupport: 'unknown',
        audioSupport: 'unknown',
        toolsCallSupport: 'unknown'
      })
    })

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
    queryClient.setQueryData(['aiModels', providerOrBaseUrl], models)

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
    refetchRemoteModels()
    toast.success('Refreshing remote models...')
  }

  return (
    <div className="space-y-4">
      <CreateModelDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleAddModels}
      />

      <ManualModelList
        models={models}
        onReorderModels={handleReorderModels}
        onDeleteModels={models => {
          handleDeleteModels(models.map(m => m.name))
        }}
        onCreateModel={() => setIsCreateDialogOpen(true)}
        onTestModels={handleTestModel}
      />

      <RemoteModelList
        models={remoteModels}
        enabled={useRemote}
        onEnabledChange={setUseRemote}
        onRefreshModels={handleRefreshRemoteModels}
        onTestModels={handleTestModel}
      />
    </div>
  )
}
