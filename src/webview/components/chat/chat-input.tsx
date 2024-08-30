import React, { useRef } from 'react'
import { EnterIcon, PlusIcon } from '@radix-ui/react-icons'
import type { ChatContext, Conversation, FileInfo } from '@webview/types/chat'
import { getFileNameFromPath } from '@webview/utils/common'

import { Button } from '../ui/button'
import { Editor, type EditorRef } from './editor/editor'
import { ContextSelector } from './selectors/context-selector'
import { FileSelector } from './selectors/file-selector'

interface ChatInputProps {
  context: ChatContext
  setContext: React.Dispatch<React.SetStateAction<ChatContext>>
  newConversation: Conversation
  setNewConversation: React.Dispatch<React.SetStateAction<Conversation>>
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
    setNewConversation(preConversation => ({
      ...preConversation,
      attachments: {
        ...preConversation.attachments,
        fileContext: {
          ...preConversation.attachments.fileContext,
          selectedFiles: files
        }
      }
    }))
  }

  const { selectedFiles } = newConversation.attachments.fileContext

  return (
    <div className="chat-input flex-shrink-0 w-full flex flex-col text-title-foreground bg-title py-2">
      <div className="chat-input-files-select-bar px-4 flex items-center">
        <FileSelector
          onChange={handleSelectedFiles}
          selectedFiles={selectedFiles}
        >
          <Button variant="outline" size="xs" className="mr-2 self-start">
            <PlusIcon className="h-3 w-3" />
          </Button>
        </FileSelector>
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map(file => (
              <div
                key={file.fullPath}
                className="bg-accent text-accent-foreground py-1 px-2 rounded text-xs"
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
