import { useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { PlusIcon } from '@radix-ui/react-icons'
import { type AIProvider } from '@shared/utils/ai-providers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@webview/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@webview/components/ui/dialog'
import { api } from '@webview/services/api-client'
import { logAndToastError } from '@webview/utils/common'
import { toast } from 'sonner'

import { ProviderCard } from './provider-card'
import { ProviderForm } from './provider-form'
import { SortableProviderCard } from './sortable-provider-card'
import { providerQueryKey } from './utils'

export const AIProviderManagement = () => {
  const queryClient = useQueryClient()
  const [editingProvider, setEditingProvider] = useState<
    AIProvider | undefined
  >(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

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

  const handleSubmit = async (data: Partial<AIProvider>) => {
    const order = providers.length + 1
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

  const handleEditProvider = (provider: AIProvider) => {
    setEditingProvider(provider)
    setIsDialogOpen(true)
  }

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProvider(undefined)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = providers.findIndex(item => item.id === active.id)
      const newIndex = providers.findIndex(item => item.id === over.id)

      const newItems = arrayMove(providers, oldIndex, newIndex)
      queryClient.setQueryData(providerQueryKey, newItems)

      const updates = [...newItems].reverse().map((item, index) => ({
        id: item.id,
        order: index + 1
      }))

      reorderProvidersMutation.mutate(updates)
    }
    setActiveId(null)
  }

  const handleRemoveProvider = (id: string) => {
    removeProviderMutation.mutate(id)
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
              <DialogDescription />
            </DialogHeader>
            <ProviderForm
              isEditMode={!!editingProvider}
              initProvider={editingProvider}
              onSubmit={handleSubmit}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={providers.map(p => p.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
            {providers.map(provider => (
              <SortableProviderCard
                key={provider.id}
                provider={provider}
                onEdit={handleEditProvider}
                onRemove={handleRemoveProvider}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div className="opacity-80">
              <ProviderCard
                provider={providers.find(p => p.id === activeId)!}
                onEdit={handleEditProvider}
                onRemove={handleRemoveProvider}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
