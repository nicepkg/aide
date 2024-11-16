import { useState } from 'react'
import type { AIProvider } from '@shared/entities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CardList } from '@webview/components/ui/card-list'
import { api } from '@webview/services/api-client'
import { logAndToastError } from '@webview/utils/common'
import { toast } from 'sonner'

import { ProviderCard } from './provider-card'
import { ProviderDialog } from './provider-dialog'
import { providerQueryKey } from './utils'

export const AIProviderManagement = () => {
  const queryClient = useQueryClient()
  const [editingProvider, setEditingProvider] = useState<
    AIProvider | undefined
  >(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: providers = [] } = useQuery({
    queryKey: providerQueryKey,
    queryFn: () => api.aiProvider.getProviders({})
  })

  const addProviderMutation = useMutation({
    mutationFn: (data: Omit<AIProvider, 'id'>) =>
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
    mutationFn: (data: AIProvider) => api.aiProvider.updateProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKey })
      toast.success('Provider updated successfully')
    },
    onError: error => {
      logAndToastError('Failed to save provider', error)
    }
  })

  const removeProviderMutation = useMutation({
    mutationFn: (providers: AIProvider[]) =>
      Promise.all(
        providers.map(p => api.aiProvider.removeProvider({ id: p.id }))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKey })
      toast.success('Provider(s) removed successfully')
    },
    onError: error => {
      logAndToastError('Failed to remove provider(s)', error)
    }
  })

  const reorderProvidersMutation = useMutation({
    mutationFn: async (newProviders: AIProvider[]) => {
      const updates = newProviders.map(item => ({
        id: item.id,
        order: item.order
      }))

      return await api.aiProvider.updateProviders(updates)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: providerQueryKey })
    }
  })

  const optimizeProviders = reorderProvidersMutation.isPending
    ? reorderProvidersMutation.variables
    : providers

  const handleSubmit = async (data: Partial<AIProvider>) => {
    const order = optimizeProviders.length + 1
    if (editingProvider) {
      updateProviderMutation.mutate({
        ...data,
        order,
        id: editingProvider.id
      } as AIProvider)
    } else {
      addProviderMutation.mutate({ ...data, order } as Omit<AIProvider, 'id'>)
    }
  }

  const handleCreateProvider = () => {
    setEditingProvider(undefined)
    setIsDialogOpen(true)
  }

  const handleEditProvider = (provider: AIProvider) => {
    setEditingProvider(provider)
    setIsDialogOpen(true)
  }

  const handleRemoveProvider = (provider: AIProvider) => {
    removeProviderMutation.mutate([provider])
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProvider(undefined)
  }

  const handleReorderProviders = (orderProviders: AIProvider[]) => {
    const newProviders = [...orderProviders]
      .reverse()
      .map((item, index) => ({
        ...item,
        order: index + 1
      }))
      .reverse()

    reorderProvidersMutation.mutate(newProviders)
  }

  return (
    <div className="space-y-6">
      <ProviderDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        provider={editingProvider}
        onSubmit={handleSubmit}
      />

      <CardList
        items={optimizeProviders}
        idField="id"
        draggable
        selectable
        onCreateItem={handleCreateProvider}
        onDeleteItems={removeProviderMutation.mutate}
        onReorderItems={handleReorderProviders}
        renderCard={({
          item: provider,
          dragHandleProps,
          isSelected,
          onSelect
        }) => (
          <ProviderCard
            provider={provider}
            onEdit={handleEditProvider}
            onRemove={handleRemoveProvider}
            dragHandleProps={dragHandleProps}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        )}
      />
    </div>
  )
}
