/* eslint-disable unused-imports/no-unused-vars */
import { useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  MentionSelector,
  type SelectedMentionStrategy
} from '@webview/components/chat/selectors/mention-selector'
import {
  useMentionManager,
  type UseMentionManagerProps
} from '@webview/hooks/use-mention-manager'
import { $getSelection, $isRangeSelection } from 'lexical'
import { data } from 'tailwindcss/defaultTheme'

import { createMentionOptions } from '../mentions'
import { $createMentionNode } from '../nodes/mention-node'

export interface MentionPluginProps extends UseMentionManagerProps {}

export function MentionPlugin(props: MentionPluginProps): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const { activeMentionType, setActiveMentionType, addMention } =
    useMentionManager(props)

  // TODO: implement mention text position
  const [mentionTextPosition, setMentionTextPosition] = useState<{
    top: number
    left: number
  }>({
    top: 0,
    left: 0
  })

  useEffect(() => {
    const removeListener = editor.registerTextContentListener(
      (textContent: string) => {
        const match = textContent.match(/@(\w*)$/)
        if (match) {
          setActiveMentionType('')
        } else {
          setActiveMentionType(null)
        }
      }
    )

    return () => {
      removeListener()
    }
  }, [editor, setActiveMentionType])

  const onMentionSelect = ({
    strategy,
    strategyAddData
  }: SelectedMentionStrategy) => {
    const { category } = strategy

    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const mentionNode = $createMentionNode(category, data)
        selection.insertNodes([mentionNode])
      }
    })
    addMention({
      strategy,
      strategyAddData
    })
  }

  return (
    <MentionSelector
      open={activeMentionType !== null}
      onSelect={onMentionSelect}
      mentionOptions={createMentionOptions()}
      onOpenChange={open => !open && setActiveMentionType(null)}
    >
      <div
        className="fixed z-99"
        style={{
          top: `${mentionTextPosition?.top}px`,
          left: `${mentionTextPosition?.left}px`
        }}
      />
    </MentionSelector>
  )
}
