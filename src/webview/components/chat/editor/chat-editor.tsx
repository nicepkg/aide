import { forwardRef, useCallback, useImperativeHandle } from 'react'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import {
  LexicalComposer,
  type InitialConfigType,
  type InitialEditorStateType
} from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { MentionNode } from '@webview/lexical/nodes/mention-node'
import {
  MentionPlugin,
  type MentionPluginProps
} from '@webview/lexical/plugins/mention-plugin'
import { cn } from '@webview/utils/common'
import {
  $getSelection,
  $isRangeSelection,
  type EditorState,
  type LexicalEditor
} from 'lexical'

const onError = (error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Editor error:', error)
}

export interface ChatEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    MentionPluginProps {
  className?: string
  editorState?: InitialEditorStateType
  placeholder?: string
  onComplete?: (
    event: React.KeyboardEvent<HTMLDivElement>,
    editorState: EditorState,
    editor: LexicalEditor,
    tags: Set<string>
  ) => void
  onChange?: (
    editorState: EditorState,
    editor: LexicalEditor,
    tags: Set<string>
  ) => void
}

export interface ChatEditorRef {
  editor: LexicalEditor
  insertSpaceAndAt: () => void
}

export const ChatEditor = forwardRef<ChatEditorRef, ChatEditorProps>(
  (
    {
      className,
      editorState,
      placeholder,
      onComplete,
      onChange,
      ...otherProps
    },
    ref
  ) => {
    const initialConfig: InitialConfigType = {
      namespace: 'TextComponentEditor',
      // theme: normalTheme,
      onError,
      editable: true,
      editorState,
      nodes: [MentionNode]
    }

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <ChatEditorInner
          ref={ref}
          className={className}
          placeholder={placeholder}
          onComplete={onComplete}
          onChange={onChange}
          {...otherProps}
        />
      </LexicalComposer>
    )
  }
)

const ChatEditorInner = forwardRef<ChatEditorRef, ChatEditorProps>(
  (
    {
      className,
      placeholder,
      onComplete,
      onChange,

      // mention plugin props
      conversation,
      setConversation,

      // div props
      ...otherProps
    },
    ref
  ) => {
    const [editor] = useLexicalComposerContext()

    const insertSpaceAndAt = useCallback(() => {
      editor.focus()
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          selection.insertText(' @')
        }
      })
    }, [editor])

    useImperativeHandle(ref, () => ({ editor, insertSpaceAndAt }), [editor])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault()
        const currentState = editor.getEditorState()
        const tags = new Set<string>()
        onComplete?.(e, currentState, editor, tags)
      }
    }

    return (
      <div
        className={cn('editor-container relative', className)}
        onKeyDown={handleKeyDown}
        tabIndex={1}
        {...otherProps}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="editor-input min-h-24 min-w-full p-2 outline-none" />
          }
          placeholder={
            <div className="editor-placeholder absolute pointer-events-none top-2 left-2 text-gray-400">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange!} />
        <MentionPlugin
          conversation={conversation}
          setConversation={setConversation}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <TabIndentationPlugin />
        {/* <TreeViewDebugPlugin /> */}
      </div>
    )
  }
)
