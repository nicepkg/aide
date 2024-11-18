/* eslint-disable unused-imports/no-unused-vars */
import React from 'react'
import { Cross1Icon, ImageIcon } from '@radix-ui/react-icons'
import {
  chatContextTypeModelSettingKeyMap,
  type ChatContext,
  type Conversation
} from '@shared/entities'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import { usePluginImagesSelectorProviders } from '@webview/hooks/chat/use-plugin-providers'
import type { Updater } from 'use-immer'

import { ModelSelector } from './model-selector'

interface ContextSelectorProps {
  context: ChatContext
  setContext: Updater<ChatContext>
  conversation: Conversation
  setConversation: Updater<Conversation>
  onFocusOnEditor?: () => void
  onClickMentionSelector?: () => void
  showExitEditModeButton?: boolean
  onExitEditMode?: () => void
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  context,
  setContext,
  conversation,
  setConversation,
  onFocusOnEditor,
  onClickMentionSelector,
  showExitEditModeButton,
  onExitEditMode
}) => {
  const { addSelectedImage } = usePluginImagesSelectorProviders()

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
        featureModelSettingKey={chatContextTypeModelSettingKeyMap[context.type]}
        onOpenChange={isOpen => !isOpen && onFocusOnEditor?.()}
        renderTrigger={({ activeModel, activeProvider }) => (
          <ButtonWithTooltip
            tooltip={
              `${activeProvider?.name} > ${activeModel?.name}` || 'Select Model'
            }
            variant="ghost"
            size="xs"
          >
            {activeModel?.name || 'Select Model'}
          </ButtonWithTooltip>
        )}
      />
      <ButtonWithTooltip
        tooltip="Add mention"
        variant="ghost"
        size="iconXs"
        onClick={onClickMentionSelector}
      >
        @
      </ButtonWithTooltip>
      <ButtonWithTooltip
        tooltip="Add image"
        variant="ghost"
        size="iconXs"
        onClick={handleSelectImage}
      >
        <ImageIcon className="size-3" />
      </ButtonWithTooltip>
      {showExitEditModeButton && (
        <ButtonWithTooltip
          tooltip="Exit edit mode"
          variant="ghost"
          size="iconXs"
          onClick={onExitEditMode}
        >
          <Cross1Icon className="size-3" />
        </ButtonWithTooltip>
      )}
    </div>
  )
}
