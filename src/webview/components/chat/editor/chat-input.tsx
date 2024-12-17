import { useEffect, useRef, type FC } from 'react'
import {
  ConversationEntity,
  type ChatContext,
  type Conversation,
  type ImageInfo
} from '@shared/entities'
import { PluginId } from '@shared/plugins/base/types'
import {
  removeDuplicates,
  tryParseJSON,
  tryStringifyJSON
} from '@shared/utils/common'
import { convertToLangchainMessageContents } from '@shared/utils/convert-to-langchain-message-contents'
import { getAllTextFromLangchainMessageContents } from '@shared/utils/get-all-text-from-langchain-message-contents'
import { mergeLangchainMessageContents } from '@shared/utils/merge-langchain-message-contents'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import { FileIcon } from '@webview/components/file-icon'
import { BorderBeam } from '@webview/components/ui/border-beam'
import { usePlugin, WithPluginProvider } from '@webview/contexts/plugin-context'
import { useCallbackRef } from '@webview/hooks/use-callback-ref'
import { api } from '@webview/services/api-client'
import { type FileInfo } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { logger } from '@webview/utils/logger'
import { AnimatePresence, motion } from 'framer-motion'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type EditorState,
  type LexicalEditor
} from 'lexical'
import { type Updater } from 'use-immer'

import { ContextSelector } from '../selectors/context-selector'
import { ChatEditor, type ChatEditorRef } from './chat-editor'
import {
  FileAttachments,
  type FileAttachmentOtherItem
} from './file-attachments'

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
  onExitEditMode?: () => void
  autoFocus?: boolean
  context: ChatContext
  borderAnimation?: boolean
  setContext: Updater<ChatContext>
  conversation: Conversation
  setConversation: Updater<Conversation>
  sendButtonDisabled: boolean
  onSend?: (conversation: Conversation) => void
}

export interface ChatInputRef extends ChatEditorRef {
  reInitializeEditor: () => void
}

const _ChatInput: FC<ChatInputProps> = ({
  ref,
  className,
  editorClassName,
  mode = ChatInputMode.Default,
  onExitEditMode,
  autoFocus = false,
  context,
  borderAnimation = false,
  setContext,
  conversation,
  setConversation,
  sendButtonDisabled,
  onSend
}) => {
  const editorRef = useRef<ChatEditorRef>(null)
  const { setState: setPluginState, getState: getPluginState } = usePlugin()

  // sync conversation plugin states with plugin registry
  useEffect(() => {
    Object.entries(conversation.pluginStates).forEach(([pluginId, state]) => {
      setPluginState(pluginId as PluginId, state)
    })
  }, [setPluginState, conversation.pluginStates])

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
      draft.pluginStates = getPluginState()
    })
  }

  const initialEditorState = (editor?: LexicalEditor) => {
    if (!editor) return

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
    } else {
      editor.update(() => {
        $getRoot().clear()
      })
    }
  }

  const getConversation = useCallbackRef(() => conversation)
  const handleSend = async () => {
    if (sendButtonDisabled || !onSend) return
    const editorState = editorRef.current?.editor.getEditorState()

    if (editorState) {
      await handleEditorChange(editorState)
    }

    // refresh mentions
    const newConversation =
      await api.mention.refreshConversationMentions(getConversation())

    logger.verbose('send conversation', newConversation)
    onSend(newConversation)
  }

  const focusOnEditor = () => editorRef.current?.focusOnEditor()

  useEffect(() => {
    editorRef.current?.editor.setEditable(
      ![ChatInputMode.MessageReadonly].includes(mode)
    )
  }, [mode])

  const reInitializeEditor = () => {
    initialEditorState(editorRef.current?.editor)
    setConversation(draft => {
      draft.richText = ''
      draft.contents = []
    })
  }

  const handleRef = (node: ChatEditorRef | null) => {
    editorRef.current = node
    if (typeof ref === 'function') {
      ref({
        ...node,
        reInitializeEditor
      } as ChatInputRef)
    } else if (ref) {
      ref.current = {
        ...node,
        reInitializeEditor
      } as ChatInputRef
    }
  }

  const handlePasteImage = (image: ImageInfo) => {
    setConversation(draft => {
      draft.state.selectedImagesFromOutsideUrl = removeDuplicates(
        [...draft.state.selectedImagesFromOutsideUrl, image],
        ['url']
      )
    })
  }

  const handleDropFiles = (files: FileInfo[]) => {
    setConversation(draft => {
      draft.state.selectedFilesFromFileSelector = removeDuplicates(
        [...draft.state.selectedFilesFromFileSelector, ...files],
        ['fullPath']
      )
    })
  }

  return (
    <AnimatePresence initial={false}>
      <motion.div
        layout
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ willChange: 'auto' }}
        className={cn(
          'chat-input relative px-4 flex-shrink-0 w-full flex flex-col border-t',
          [ChatInputMode.MessageReadonly, ChatInputMode.MessageEdit].includes(
            mode
          ) && 'border-none px-0',
          [ChatInputMode.MessageReadonly].includes(mode) && 'cursor-pointer',
          className
        )}
      >
        <AnimatedFileAttachments
          mode={mode}
          conversation={conversation}
          setConversation={setConversation}
          onFocusEditor={focusOnEditor}
        />

        <motion.div
          layout="preserve-aspect"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ willChange: 'auto' }}
        >
          <ChatEditor
            ref={handleRef}
            initialConfig={{
              editable: ![ChatInputMode.MessageReadonly].includes(mode),
              editorState: initialEditorState
            }}
            onComplete={onSend ? handleSend : undefined}
            onChange={handleEditorChange}
            placeholder={[
              'Type your message here...',
              '@web which the diff between the react18 and react19?',
              '@main.ts please review the code'
            ]}
            autoFocus={autoFocus}
            className={cn(
              'min-h-24 max-h-64 overflow-y-auto rounded-lg bg-background shadow-none focus-visible:ring-0',
              [
                ChatInputMode.MessageReadonly,
                ChatInputMode.MessageEdit
              ].includes(mode) && 'rounded-none border-none my-0',
              [ChatInputMode.MessageReadonly].includes(mode) &&
                'min-h-0 min-w-0 h-auto w-auto',
              editorClassName
            )}
            contentEditableClassName={cn(
              [ChatInputMode.MessageReadonly].includes(mode) &&
                'min-h-0 min-w-0 h-auto w-auto'
            )}
            onPasteImage={handlePasteImage}
            onDropFiles={handleDropFiles}
          />

          <AnimatePresence mode="wait">
            {![ChatInputMode.MessageReadonly].includes(mode) && (
              <motion.div
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ willChange: 'auto' }}
                className={cn(
                  'chat-input-actions flex justify-between',
                  [ChatInputMode.MessageEdit].includes(mode) && 'px-2',
                  [ChatInputMode.MessageEdit, ChatInputMode.Default].includes(
                    mode
                  ) && 'mb-2'
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
                  onFocusOnEditor={focusOnEditor}
                  showExitEditModeButton={mode === ChatInputMode.MessageEdit}
                  onExitEditMode={onExitEditMode}
                />
                {onSend && (
                  <ButtonWithTooltip
                    variant="outline"
                    disabled={sendButtonDisabled}
                    size="xs"
                    className="ml-auto rounded-md"
                    onClick={handleSend}
                    tooltip="You can use ⌘↩ to send message"
                  >
                    ⌘↩ Send
                  </ButtonWithTooltip>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        {borderAnimation && <BorderBeam duration={2} delay={0.5} />}
      </motion.div>
    </AnimatePresence>
  )
}

export const ChatInput = WithPluginProvider(_ChatInput)

interface AnimatedFileAttachmentsProps {
  mode: ChatInputMode
  conversation: Conversation
  setConversation: Updater<Conversation>
  onFocusEditor: () => void
}

export const AnimatedFileAttachments: React.FC<
  AnimatedFileAttachmentsProps
> = ({ mode, conversation, setConversation, onFocusEditor }) => {
  const selectedFiles = conversation?.state?.selectedFilesFromFileSelector || []
  const setSelectedFiles = (files: FileInfo[]) => {
    setConversation(draft => {
      if (!draft.state) {
        draft.state = new ConversationEntity().entity.state
      }
      draft.state.selectedFilesFromFileSelector = removeDuplicates(files, [
        'fullPath'
      ])
    })
  }

  const selectedOtherItems: FileAttachmentOtherItem[] =
    conversation.state?.selectedImagesFromOutsideUrl?.map(
      img =>
        ({
          id: img.url,
          label: img.name || 'image',
          type: 'image',
          icon: <FileIcon className="size-2.5 mr-1" filePath="example.png" />,
          item: img,
          previewConfig: {
            type: 'image',
            url: img.url
          }
        }) satisfies FileAttachmentOtherItem
    )

  const setSelectedOtherItems = (items: FileAttachmentOtherItem[]) => {
    setConversation(draft => {
      const selectedImages: ImageInfo[] = []
      items.forEach(item => {
        if (item.type === 'image') {
          selectedImages.push(item.item as ImageInfo)
        }
      })

      draft.state.selectedImagesFromOutsideUrl = removeDuplicates(
        selectedImages,
        ['url']
      )
    })
  }

  if ([ChatInputMode.MessageReadonly].includes(mode)) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout="preserve-aspect"
        initial={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ willChange: 'auto' }}
      >
        <FileAttachments
          className={cn(
            [ChatInputMode.MessageReadonly, ChatInputMode.MessageEdit].includes(
              mode
            ) && 'px-2'
          )}
          showFileSelector={![ChatInputMode.MessageReadonly].includes(mode)}
          selectedFiles={selectedFiles}
          selectedOtherItems={selectedOtherItems}
          onSelectedFilesChange={setSelectedFiles}
          onSelectedOtherItemsChange={setSelectedOtherItems}
          onOpenChange={isOpen => !isOpen && onFocusEditor()}
        />
      </motion.div>
    </AnimatePresence>
  )
}
