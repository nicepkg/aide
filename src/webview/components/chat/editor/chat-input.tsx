import { forwardRef, useEffect, useRef } from 'react'
import { Button } from '@webview/components/ui/button'
import { getDefaultConversationAttachments } from '@webview/hooks/chat/use-conversation'
import { useCloneState } from '@webview/hooks/use-clone-state'
import type { ChatContext, Conversation, FileInfo } from '@webview/types/chat'
import { cn, tryParseJSON, tryStringifyJSON } from '@webview/utils/common'
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
  className?: string
  editorClassName?: string
  mode?: ChatInputMode
  autoFocus?: boolean
  context: ChatContext
  setContext: Updater<ChatContext>
  conversation: Conversation
  setConversation: Updater<Conversation>
  sendButtonDisabled: boolean
  onSend: (conversation: Conversation) => void
}

export interface ChatInputRef extends ChatEditorRef {}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  (
    {
      className,
      editorClassName,
      mode = ChatInputMode.Default,
      autoFocus = false,
      context,
      setContext,
      conversation: _conversation,
      setConversation: _setConversation,
      sendButtonDisabled,
      onSend
    },
    ref
  ) => {
    const editorRef = useRef<ChatEditorRef>(null)
    const [conversation, setConversation, applyConversation] = useCloneState(
      _conversation,
      _setConversation
    )
    const selectedFiles =
      conversation.attachments?.fileContext?.selectedFiles ?? []

    const handleEditorChange = (editorState: EditorState) => {
      setConversation(draft => {
        draft.richText = tryStringifyJSON(editorState.toJSON()) || ''
        draft.content = editorState.read(() => $getRoot().getTextContent())
      })
    }

    const initialEditorState = (editor: LexicalEditor) => {
      const { richText, content } = conversation

      if (richText) {
        const richTextObj = tryParseJSON(richText)

        if (!richTextObj) return

        const editorState = editor.parseEditorState(richTextObj)
        editor.setEditorState(editorState)
      } else if (content) {
        // todo: add support for content, a common string
        editor.update(() => {
          const root = $getRoot()
          const paragraph = $createParagraphNode()
          const text = $createTextNode(content)
          paragraph.append(text)
          root.clear()
          root.append(paragraph)
        })
      }
    }

    const handleSend = () => {
      if (sendButtonDisabled) return
      onSend(conversation)
    }

    const handleEditorCompleted = () => {
      applyConversation()
      handleSend()
    }

    const handleSelectedFiles = (files: FileInfo[]) => {
      setConversation(draft => {
        if (!draft.attachments) {
          draft.attachments = getDefaultConversationAttachments()
        }

        draft.attachments.fileContext.selectedFiles = files
      })
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
          'chat-input px-4 flex-shrink-0 w-full flex flex-col border-t',
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
            onComplete={handleEditorCompleted}
            onChange={handleEditorChange}
            placeholder="Type your message here..."
            autoFocus={autoFocus}
            conversation={conversation}
            setConversation={setConversation}
            className={cn(
              'min-h-24 max-h-64 my-2 border overflow-y-auto rounded-lg bg-background shadow-none focus-visible:ring-0',
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
      </div>
    )
  }
)
