import { useEffect, useId, useImperativeHandle, type FC, type Ref } from 'react'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import {
  LexicalComposer,
  type InitialConfigType
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
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ENTER_COMMAND,
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
  ref?: Ref<ChatEditorRef>
  className?: string
  contentEditableClassName?: string
  initialConfig?: Partial<InitialConfigType>
  placeholder?: string
  autoFocus?: boolean
  onComplete?: (
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
  focusOnEditor: (autoMoveCursorToEnd?: boolean) => void
  resetEditor: () => void
}

export const ChatEditor: FC<ChatEditorProps> = ({
  ref,
  className,
  initialConfig,
  placeholder,
  autoFocus = false,
  onComplete,
  onChange,
  ...otherProps
}) => {
  const id = useId()
  const finalInitialConfig: InitialConfigType = {
    namespace: `TextComponentEditor-${id}`,
    // theme: normalTheme,
    onError,
    editable: true,
    nodes: [MentionNode],
    ...initialConfig
  }

  return (
    <LexicalComposer initialConfig={finalInitialConfig}>
      <ChatEditorInner
        ref={ref}
        className={className}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onComplete={onComplete}
        onChange={onChange}
        {...otherProps}
      />
    </LexicalComposer>
  )
}

const ChatEditorInner: FC<ChatEditorProps> = ({
  ref,
  className,
  contentEditableClassName,
  placeholder,
  autoFocus,
  onComplete,
  onChange,

  // div props
  ...otherProps
}) => {
  const [editor] = useLexicalComposerContext()

  const insertSpaceAndAt = () => {
    editor.focus()
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.insertText(' @')
      }
    })
  }

  const focusOnEditor = (autoMoveCursorToEnd = false) => {
    const rootEl = editor.getRootElement()

    if (!rootEl?.children?.length) {
      rootEl?.focus({
        preventScroll: true
      }) // if the editor is empty, focus on it
    } else {
      editor.focus(
        () => {
          rootEl.focus({
            preventScroll: true
          })
        },
        {
          defaultSelection: 'rootEnd'
        }
      )

      if (autoMoveCursorToEnd) {
        // move the cursor to the end of the editor
        editor.update(() => {
          const root = $getRoot()
          const lastChild = root.getLastChild()
          lastChild?.selectEnd()
        })
      }
    }
  }

  const resetEditor = () => {
    editor.update(() => {
      const root = $getRoot()
      root.clear()
    })
  }

  useEffect(() => {
    if (!autoFocus) return
    focusOnEditor()
  }, [autoFocus, focusOnEditor])

  useImperativeHandle(
    // eslint-disable-next-line react-compiler/react-compiler
    ref,
    () => ({ editor, insertSpaceAndAt, focusOnEditor, resetEditor }),
    [editor]
  )

  useEffect(() => {
    const removeKeyEnterListener = editor.registerCommand(
      KEY_ENTER_COMMAND,
      event => {
        if (event && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()
          const currentState = editor.getEditorState()
          const tags = new Set<string>()
          onComplete?.(currentState, editor, tags)
          return true // prevent other Enter behaviors
        }

        return false // allow other Enter behaviors
      },
      COMMAND_PRIORITY_CRITICAL
    )

    return () => {
      removeKeyEnterListener()
    }
  }, [editor, onComplete])

  return (
    <div
      className={cn('editor-container relative', className)}
      tabIndex={1}
      {...otherProps}
    >
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={cn(
              'editor-input min-h-24 min-w-full p-2 outline-none',
              contentEditableClassName
            )}
          />
        }
        placeholder={
          <div className="editor-placeholder absolute pointer-events-none top-2 left-2 text-foreground/50">
            {placeholder}
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin onChange={onChange!} />
      <MentionPlugin />
      <HistoryPlugin />
      {autoFocus && <AutoFocusPlugin defaultSelection="rootEnd" />}
      <TabIndentationPlugin />
      {/* <TreeViewDebugPlugin /> */}
    </div>
  )
}
