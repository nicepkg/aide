import React, { useCallback, useState, type FC } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  MentionSelector,
  type SelectedMentionStrategy
} from '@webview/components/chat/selectors/mention-selector'
import type { IMentionStrategy } from '@webview/types/chat'
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  type RangeSelection
} from 'lexical'

import { useCursorPosition } from '../hooks/use-cursor-position'
import { useEditorCommands } from '../hooks/use-editor-commands'
import {
  useMentionManager,
  type UseMentionManagerProps
} from '../hooks/use-mention-manager'
import { useMentionSearch } from '../hooks/use-mention-search'
import { createMentionOptions } from '../mentions'
import { $createMentionNode } from '../nodes/mention-node'

export interface MentionPluginProps extends UseMentionManagerProps {}

export const MentionPlugin: FC<MentionPluginProps> = props => {
  const [editor] = useLexicalComposerContext()
  const { addMention } = useMentionManager(props)
  const [isOpen, setIsOpen] = useState(false)
  const cursorPosition = useCursorPosition(editor)
  const mentionOptions = createMentionOptions()

  const { searchQuery, setSearchQuery } = useMentionSearch(editor, setIsOpen)

  useEditorCommands(editor, isOpen, setIsOpen)

  const handleMentionSelect = useCallback(
    ({ strategy, strategyAddData }: SelectedMentionStrategy) => {
      setIsOpen(false)
      setSearchQuery('')

      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          insertMention(selection, strategy, strategyAddData, searchQuery)
        }
      })
      addMention({ strategy, strategyAddData })
    },
    [editor, addMention, searchQuery, setSearchQuery]
  )

  return (
    <MentionSelector
      lexicalMode
      open={isOpen}
      onOpenChange={setIsOpen}
      onSelect={handleMentionSelect}
      searchQuery={searchQuery}
      mentionOptions={mentionOptions}
    >
      <div
        style={{
          position: 'fixed',
          top: `${cursorPosition.top - 30}px`,
          left: `${cursorPosition.left}px`,
          zIndex: 2
        }}
      />
    </MentionSelector>
  )
}

const insertMention = (
  selection: RangeSelection,
  strategy: IMentionStrategy,
  strategyAddData: any,
  searchQuery: string
) => {
  // Delete the @ symbol and the search query
  const anchorOffset = selection.anchor.offset
  selection.anchor.offset = anchorOffset - (searchQuery.length + 1)
  selection.focus.offset = anchorOffset
  selection.removeText()

  // Create and insert the mention node
  const mentionNode = $createMentionNode(strategy.category, strategyAddData)
  mentionNode.setTextContent(`@${strategyAddData.label || strategy.name}`)
  selection.insertNodes([mentionNode])

  // Insert a space after the mention node
  const spaceNode = $createTextNode(' ')
  mentionNode.insertAfter(spaceNode)

  // Move selection after the space
  spaceNode.select()
}
