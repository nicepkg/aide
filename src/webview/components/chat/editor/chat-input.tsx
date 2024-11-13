import { useEffect, useRef, type FC } from 'react'
import type { ChatContext, Conversation } from '@shared/entities'
import { PluginId } from '@shared/plugins/base/types'
import { tryParseJSON, tryStringifyJSON } from '@shared/utils/common'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'
import { getAllTextFromLangchainMessageContents } from '@shared/utils/get-all-text-from-langchain-message-contents'
import { mergeLangchainMessageContents } from '@shared/utils/merge-langchain-message-contents'
import { BorderBeam } from '@webview/components/ui/border-beam'
import { Button } from '@webview/components/ui/button'
import {
  usePluginRegistry,
  WithPluginRegistryProvider
} from '@webview/contexts/plugin-registry-context'
import { useMentionOptions } from '@webview/hooks/chat/use-mention-options'
import { usePluginFilesSelectorProviders } from '@webview/hooks/chat/use-plugin-providers'
import { useCallbackRef } from '@webview/hooks/use-callback-ref'
import { useCloneState } from '@webview/hooks/use-clone-state'
import { type FileInfo } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { logger } from '@webview/utils/logger'
import { updatePluginStatesFromEditorState } from '@webview/utils/plugin-states'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type EditorState,
  type LexicalEditor
} from 'lexical'
import type { Updater } from 'use-immer'

import { ContextSelector } from '../selectors/context-selector'
import { ChatEditor, type ChatEditorRef } from './chat-editor'
import { FileAttachments } from './file-attachments'

export enum ChatInputMode {
  Default = 'default',
  MessageEdit = 'message-edit',
  MessageReadonly = 'message-readonly'
}

export interface ChatInputProps {
  ref?: React.Ref<ChatInputRef>
  className?: string
  editorClassName?: string
  mode?: ChatInputMode
  autoFocus?: boolean
  context: ChatContext
  borderAnimation?: boolean
  setContext: Updater<ChatContext>
  conversation: Conversation
  setConversation: Updater<Conversation>
  sendButtonDisabled: boolean
  onSend: (conversation: Conversation) => void
}

export interface ChatInputRef extends ChatEditorRef {}

const _ChatInput: FC<ChatInputProps> = ({
  ref,
  className,
  editorClassName,
  mode = ChatInputMode.Default,
  autoFocus = false,
  context,
  borderAnimation = false,
  setContext,
  conversation: _conversation,
  setConversation: _setConversation,
  sendButtonDisabled,
  onSend
}) => {
  const editorRef = useRef<ChatEditorRef>(null)
  const { pluginRegistry, getPluginRegistry } = usePluginRegistry()
  const { selectedFiles, setSelectedFiles } = usePluginFilesSelectorProviders()
  const mentionOptions = useMentionOptions()

  const [conversation, setConversation, applyConversation] = useCloneState(
    _conversation,
    _setConversation
  )

  // sync conversation plugin states with plugin registry
  useEffect(() => {
    Object.entries(conversation.pluginStates).forEach(([pluginId, state]) => {
      getPluginRegistry()?.setState(pluginId as PluginId, state)
    })
  }, [getPluginRegistry, conversation.pluginStates])

  const handleEditorChange = async (editorState: EditorState) => {
    const newRichText = tryStringifyJSON(editorState.toJSON()) || ''

    setConversation(draft => {
      if (draft.richText !== newRichText) {
        draft.richText = newRichText
        draft.contents = mergeLangchainMessageContents(
          convertToLangchainMessageContents(
            editorState.read(() => $getRoot().getTextContent())
          )
        )
      }
    })

    updatePluginStatesFromEditorState(editorState, mentionOptions)
    setConversation(draft => {
      draft.pluginStates = pluginRegistry?.providerManagers.state.getAll() || {}
    })
  }

  const initialEditorState = (editor: LexicalEditor) => {
    const { richText, contents } = conversation

    if (richText) {
      const richTextObj = tryParseJSON(richText)

      if (!richTextObj) return

      const editorState = editor.parseEditorState(richTextObj)
      editor.setEditorState(editorState)
    } else if (contents) {
      // todo: add support for content, a common string
      editor.update(() => {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        const text = $createTextNode(
          getAllTextFromLangchainMessageContents(contents)
        )
        paragraph.append(text)
        root.clear()
        root.append(paragraph)
      })
    }
  }

  const getConversation = useCallbackRef(() => conversation)
  const handleSend = async () => {
    if (sendButtonDisabled) return
    const editorState = editorRef.current?.editor.getEditorState()

    if (editorState) {
      await handleEditorChange(editorState)
    }

    applyConversation()
    logger.verbose('send conversation', getConversation())
    onSend(getConversation())
  }

  const handleSelectedFiles = (files: FileInfo[]) => {
    setSelectedFiles?.(files)
  }

  const focusOnEditor = () => editorRef.current?.focusOnEditor()

  useEffect(() => {
    editorRef.current?.editor.setEditable(
      ![ChatInputMode.MessageReadonly].includes(mode)
    )
  }, [mode])

  return (
    <div
      className={cn(
        'chat-input relative px-4 flex-shrink-0 w-full flex flex-col border-t',
        [ChatInputMode.MessageReadonly, ChatInputMode.MessageEdit].includes(
          mode
        ) && 'border-none px-0',
        className
      )}
    >
      <FileAttachments
        className={cn(
          [ChatInputMode.MessageReadonly, ChatInputMode.MessageEdit].includes(
            mode
          ) && 'px-2'
        )}
        showFileSelector={![ChatInputMode.MessageReadonly].includes(mode)}
        selectedFiles={selectedFiles}
        onSelectedFilesChange={handleSelectedFiles}
        onOpenChange={isOpen => !isOpen && focusOnEditor()}
      />
      <div>
        <ChatEditor
          ref={node => {
            ;(editorRef as any).current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
          }}
          initialConfig={{
            editable: ![ChatInputMode.MessageReadonly].includes(mode),
            editorState: initialEditorState
          }}
          onComplete={handleSend}
          onChange={handleEditorChange}
          placeholder={[
            'Type your message here...',
            '@web which the diff between the react18 and react19?',
            '@main.ts please review the code'
          ]}
          autoFocus={autoFocus}
          className={cn(
            'min-h-24 max-h-64 overflow-y-auto rounded-lg bg-background shadow-none focus-visible:ring-0',
            [ChatInputMode.MessageReadonly, ChatInputMode.MessageEdit].includes(
              mode
            ) && 'rounded-none border-none my-0',
            [ChatInputMode.MessageReadonly].includes(mode) &&
              'min-h-0 min-w-0 h-auto w-auto',
            editorClassName
          )}
          contentEditableClassName={cn(
            [ChatInputMode.MessageReadonly].includes(mode) &&
              'min-h-0 min-w-0 h-auto w-auto'
          )}
        />
        <div
          className={cn(
            'chat-input-actions flex justify-between mb-2',
            [ChatInputMode.MessageReadonly].includes(mode) && 'hidden',
            [ChatInputMode.MessageEdit].includes(mode) && 'px-2'
          )}
        >
          <ContextSelector
            context={context}
            setContext={setContext}
            conversation={conversation}
            setConversation={setConversation}
            onClickMentionSelector={() => {
              editorRef.current?.insertSpaceAndAt()
            }}
            onClose={focusOnEditor}
          />
          <Button
            variant="outline"
            disabled={sendButtonDisabled}
            size="xs"
            className="ml-auto"
            onClick={handleSend}
          >
            ⌘↩ Send
          </Button>
        </div>
      </div>
      {borderAnimation && <BorderBeam duration={2} delay={0.5} />}
    </div>
  )
}

export const ChatInput = WithPluginRegistryProvider(_ChatInput)
