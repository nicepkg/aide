/* eslint-disable unused-imports/no-unused-vars */
import React, { useState } from 'react'
import { ImageIcon } from '@radix-ui/react-icons'
import type { ChatContext, Conversation } from '@shared/types/chat-context'
import { Button } from '@webview/components/ui/button'
import { usePluginImagesSelectorProviders } from '@webview/hooks/chat/use-plugin-providers'
import { type ModelOption } from '@webview/types/chat'
import type { Updater } from 'use-immer'

import { ModelSelector } from './model-selector'

interface ContextSelectorProps {
  context: ChatContext
  setContext: Updater<ChatContext>
  conversation: Conversation
  setConversation: Updater<Conversation>
  onClose?: () => void
  onClickMentionSelector?: () => void
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  context,
  setContext,
  conversation,
  setConversation,
  onClose,
  onClickMentionSelector
}) => {
  const [modelOptions] = useState<ModelOption[]>([
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ])

  const [selectedModel, setSelectedModel] = useState(modelOptions[0])
  const { addSelectedImage } = usePluginImagesSelectorProviders()

  const handleSelectModel = (model: ModelOption) => {
    setSelectedModel(model)
    setContext(draft => {
      draft.settings.modelName = model.value
    })
  }

  const handleSelectImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = event => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = e => {
          const base64Image = e.target?.result as string
          addSelectedImage?.({ url: base64Image })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <div className="context-selector flex items-center flex-1">
      <ModelSelector
        onSelect={handleSelectModel}
        modelOptions={modelOptions}
        onOpenChange={isOpen => !isOpen && onClose?.()}
      >
        <Button variant="ghost" size="xs">
          {selectedModel?.label}
        </Button>
      </ModelSelector>
      <Button variant="ghost" size="xs" onClick={onClickMentionSelector}>
        @ Mention
      </Button>
      <Button variant="ghost" size="xs" onClick={handleSelectImage}>
        <ImageIcon className="h-3 w-3 mr-1" />
        Image
      </Button>
    </div>
  )
}
