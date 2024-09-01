/* eslint-disable unused-imports/no-unused-vars */
import React, { useState } from 'react'
import { ImageIcon } from '@radix-ui/react-icons'
import { Button } from '@webview/components/ui/button'
import { createMentionOptions } from '@webview/lexical/mentions'
import type {
  ChatContext,
  Conversation,
  ModelOption
} from '@webview/types/chat'
import type { Updater } from 'use-immer'

import {
  MentionSelector,
  type SelectedMentionStrategy
} from './mention-selector'
import { ModelSelector } from './model-selector'

interface ContextSelectorProps {
  context: ChatContext
  setContext: Updater<ChatContext>
  newConversation: Conversation
  setNewConversation: Updater<Conversation>
  onClose?: () => void
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  context,
  setContext,
  newConversation,
  setNewConversation,
  onClose
}) => {
  const [modelOptions] = useState<ModelOption[]>([
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ])

  const [selectedModel, setSelectedModel] = useState(modelOptions[0])

  const handleSelectModel = (model: ModelOption) => {
    setSelectedModel(model)
    setContext(draft => {
      draft.settings.modelName = model.value
    })
  }

  const handleSelectMention = (option: SelectedMentionStrategy) => {
    // Handle mention selection
    console.log('Selected mention:', option)
  }

  const handleSelectImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = event => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log('Selected image:', file)
      }
    }
    input.click()
    setNewConversation(draft => {
      draft.attachments.fileContext.selectedImages.push({
        url: 'https://example.com/image.jpg'
      })
    })
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
      <MentionSelector
        mentionOptions={createMentionOptions()}
        onSelect={handleSelectMention}
        onOpenChange={isOpen => !isOpen && onClose?.()}
      >
        <Button variant="ghost" size="xs" className="ml-2">
          @ Mention
        </Button>
      </MentionSelector>
      <Button
        variant="ghost"
        size="xs"
        className="ml-2"
        onClick={handleSelectImage}
      >
        <ImageIcon className="h-3 w-3 mr-1" />
        Image
      </Button>
    </div>
  )
}
