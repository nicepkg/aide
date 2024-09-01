import React, { useRef } from 'react'
import { EnterIcon, PlusIcon } from '@radix-ui/react-icons'
import type { ChatContext, Conversation, FileInfo } from '@webview/types/chat'
import { getFileNameFromPath } from '@webview/utils/common'
import type { Updater } from 'use-immer'

import { Button } from '../ui/button'
import { Editor, type EditorRef } from './editor/editor'
import { ContextSelector } from './selectors/context-selector'
import { FileSelector } from './selectors/file-selector'

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
  const editorRef = useRef<EditorRef>(null)

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

  const { selectedFiles } = newConversation.attachments.fileContext

  return (
    <div className="chat-input flex-shrink-0 w-full flex flex-col text-title-foreground bg-title py-2">
      <div className="chat-input-files-select-bar px-4 flex items-center">
        <FileSelector
          onChange={handleSelectedFiles}
          selectedFiles={selectedFiles}
          onOpenChange={isOpen => !isOpen && focusOnEditor()}
        >
          <Button variant="outline" size="xss" className="mr-2 self-start">
            <PlusIcon className="h-2.5 w-2.5" />
          </Button>
        </FileSelector>
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map(file => (
              <div
                key={file.fullPath}
                className="cursor-pointer bg-accent text-accent-foreground px-1 py-0.5 rounded text-xs"
              >
                {getFileNameFromPath(file.fullPath)}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="px-4 pt-2">
        <Editor
          ref={editorRef}
          onComplete={handleEditorCompleted}
          onChange={handleEditorChange}
          placeholder="Type your message here..."
          newConversation={newConversation}
          setNewConversation={setNewConversation}
          className="min-h-24 max-h-64 overflow-y-auto rounded-lg bg-background border-0 shadow-none focus-visible:ring-0"
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
            Send
            <EnterIcon className="ml-2 size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
