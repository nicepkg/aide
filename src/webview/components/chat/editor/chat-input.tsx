import React, { useRef } from 'react'
import { PlusIcon } from '@radix-ui/react-icons'
import type { ChatContext, Conversation, FileInfo } from '@webview/types/chat'
import { getFileNameFromPath } from '@webview/utils/common'
import type { Updater } from 'use-immer'

import { Button } from '../../ui/button'
import { ContextSelector } from '../selectors/context-selector'
import { FileSelector } from '../selectors/file-selector'
import { ChatEditor, type ChatEditorRef } from './chat-editor'
import { FileInfoPopover } from './file-info-popover'

interface ChatInputProps {
  context: ChatContext
  setContext: Updater<ChatContext>
  newConversation: Conversation
  setNewConversation: Updater<Conversation>
  sendButtonDisabled: boolean
  onSend: () => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  context,
  setContext,
  newConversation,
  setNewConversation,
  sendButtonDisabled,
  onSend
}) => {
  const editorRef = useRef<ChatEditorRef>(null)

  const { selectedFiles } = newConversation.attachments.fileContext

  const handleEditorChange = () => {}

  const handleEditorCompleted = () => {
    onSend()
  }

  const handleSelectedFiles = (files: FileInfo[]) => {
    setNewConversation(draft => {
      draft.attachments.fileContext.selectedFiles = files
    })
  }

  const focusOnEditor = () => editorRef.current?.editor.focus()

  return (
    <div className="chat-input flex-shrink-0 w-full flex flex-col border-t pb-2">
      <div className="chat-input-files-select-bar px-4 flex flex-wrap items-center">
        <FileSelector
          onChange={handleSelectedFiles}
          selectedFiles={selectedFiles}
          onOpenChange={isOpen => !isOpen && focusOnEditor()}
        >
          <Button
            variant="outline"
            size="iconXss"
            className="mr-2 mt-2 self-start"
          >
            <PlusIcon className="size-2.5" />
          </Button>
        </FileSelector>
        {selectedFiles.map(file => (
          <FileInfoPopover key={file.fullPath} file={file}>
            <div className="cursor-pointer bg-accent text-accent-foreground px-1 py-0.5 mr-2 mt-2 rounded text-xs">
              {getFileNameFromPath(file.fullPath)}
            </div>
          </FileInfoPopover>
        ))}
      </div>
      <div className="px-4 pt-2">
        <ChatEditor
          ref={editorRef}
          onComplete={handleEditorCompleted}
          onChange={handleEditorChange}
          placeholder="Type your message here..."
          newConversation={newConversation}
          setNewConversation={setNewConversation}
          className="min-h-24 max-h-64 border overflow-y-auto rounded-lg bg-background shadow-none focus-visible:ring-0"
        />
        <div className="chat-input-actions flex justify-between mt-2">
          <ContextSelector
            context={context}
            setContext={setContext}
            newConversation={newConversation}
            setNewConversation={setNewConversation}
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
