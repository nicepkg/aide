import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { EnterIcon, ImageIcon, PlusIcon } from '@radix-ui/react-icons' // 添加 PlusIcon
import { ChatProvider } from '@webview/contexts/chat-context'
import { useFileSearch } from '@webview/hooks/use-file-search'

import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Editor, type EditorProps, type EditorRef } from './editor/editor'
import { MentionSelector } from './editor/mention-selector'
import { ModelSelector } from './editor/model-selector'
import type { FileItem, MentionOption, ModelOption } from './editor/types'

export interface ChatInputRef extends EditorRef {}
export interface ChatInputProps {
  editorProps: EditorProps
  sendButtonDisabled: boolean
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  ({ editorProps, sendButtonDisabled }, ref) => {
    const { searchQuery, setSearchQuery, filteredFiles } = useFileSearch()
    const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
    const editorRef = useRef<EditorRef>(null)

    const [modelOptions] = useState<ModelOption[]>([
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
    ])

    const [mentionOptions] = useState<MentionOption[]>([
      { value: 'file', label: 'File' },
      { value: 'folder', label: 'Folder' },
      { value: 'code', label: 'Code' },
      { value: 'web', label: 'Web' },
      { value: 'git', label: 'Git' },
      { value: 'codebase', label: 'Codebase' }
    ])

    const [selectedModel, setSelectedModel] = useState(modelOptions[0])

    useImperativeHandle(ref, () => ({
      editor: editorRef.current!.editor
    }))

    const handleMentionSelect = (option: MentionOption) => {
      // Handle mention selection
      console.log('Selected mention:', option)
    }

    const handleImageSelect = () => {
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
    }

    const handleFileSelect = (file: FileItem) => {
      setSelectedFiles(prev => [...prev, file])
    }

    return (
      <div className="flex-shrink-0 w-full flex flex-col text-muted-foreground bg-muted py-2">
        <div className="px-4 flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="xs" className="mr-2 self-start">
                <PlusIcon className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" side="top">
              <Command>
                <CommandInput
                  placeholder="Search files..."
                  value={searchQuery}
                  onValueChange={search => setSearchQuery(search)}
                />
                <CommandList>
                  <CommandEmpty>No files found.</CommandEmpty>
                  <CommandGroup heading="Files">
                    {filteredFiles.map((file, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleFileSelect(file)}
                      >
                        {file.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="bg-gray-700 py-1 px-2 rounded text-xs"
                >
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-grow overflow-y-auto">{/* 其他内容 */}</div>
        <div className="px-4 pt-2">
          <ChatProvider>
            <Editor ref={editorRef} {...editorProps} />
          </ChatProvider>
          <div className="flex justify-between mt-2">
            <div className="flex items-center flex-1">
              <ModelSelector
                selectedModel={selectedModel || modelOptions[0]!}
                setSelectedModel={setSelectedModel}
                modelOptions={modelOptions}
              />
              <MentionSelector
                mentionOptions={mentionOptions}
                onSelect={handleMentionSelect}
              />
              <Button
                variant="ghost"
                size="xs"
                className="ml-2"
                onClick={handleImageSelect}
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                Image
              </Button>
            </div>

            <div className="flex items-center h-full">
              <Button
                variant="outline"
                disabled={sendButtonDisabled}
                size="xs"
                className="ml-auto"
              >
                Send
                <EnterIcon className="ml-2 size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
