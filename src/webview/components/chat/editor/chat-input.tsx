import React, { useRef } from 'react'
import type { ChatContext, Conversation, FileInfo } from '@webview/types/chat'
import type { Updater } from 'use-immer'

import { Button } from '../../ui/button'
import { ContextSelector } from '../selectors/context-selector'
import { ChatEditor, type ChatEditorRef } from './chat-editor'
import { FileAttachments } from './file-attachments'

interface ChatInputProps {
  context: ChatContext
  setContext: Updater<ChatContext>
  conversation: Conversation
  setConversation: Updater<Conversation>
  sendButtonDisabled: boolean
  onSend: () => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  context,
  setContext,
  conversation,
  setConversation,
  sendButtonDisabled,
  onSend
}) => {
  const editorRef = useRef<ChatEditorRef>(null)

  const { selectedFiles } = conversation.attachments.fileContext

  const handleEditorChange = () => {}

  const handleEditorCompleted = () => {
    onSend()
  }

  const handleSelectedFiles = (files: FileInfo[]) => {
    setConversation(draft => {
      draft.attachments.fileContext.selectedFiles = files
    })
  }

  const focusOnEditor = () => editorRef.current?.editor.focus()

  return (
    <div className="chat-input flex-shrink-0 w-full flex flex-col border-t pb-2">
      <FileAttachments
        selectedFiles={selectedFiles}
        onSelectedFilesChange={handleSelectedFiles}
        onOpenChange={isOpen => !isOpen && focusOnEditor()}
      />
      <div className="px-4 pt-2">
        <ChatEditor
          ref={editorRef}
          onComplete={handleEditorCompleted}
          onChange={handleEditorChange}
          placeholder="Type your message here..."
          conversation={conversation}
          setConversation={setConversation}
          className="min-h-24 max-h-64 border overflow-y-auto rounded-lg bg-background shadow-none focus-visible:ring-0"
        />
        <div className="chat-input-actions flex justify-between mt-2">
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
            onClick={onSend}
          >
            ⌘↩ Send
          </Button>
        </div>
      </div>
    </div>
  )
}
