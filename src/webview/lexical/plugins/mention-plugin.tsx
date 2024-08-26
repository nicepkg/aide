import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { MentionSelector } from '@webview/components/mention-selector'
import { useMentionContext } from '@webview/hooks/use-mention-context'
import { $getSelection, $isRangeSelection } from 'lexical'

import { $createMentionNode } from '../nodes/mention-node'

export function MentionPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const { activeMentionType, setActiveMentionType, handleMentionSelect } =
    useMentionContext()

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

  const onMentionSelect = (type: string, data: any) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const mentionNode = $createMentionNode(type, data)
        selection.insertNodes([mentionNode])
      }
    })
    handleMentionSelect(type, data)
  }

  return (
    <MentionSelector
      isOpen={activeMentionType !== null}
      onSelect={onMentionSelect}
      onClose={() => setActiveMentionType(null)}
    />
  )
}
