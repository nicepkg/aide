import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { MentionNode } from '@webview/lexical/nodes/mention-node'
import { MentionPlugin } from '@webview/lexical/plugins/mention-plugin'

const theme = {
  paragraph: 'editor-paragraph',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline'
  }
}

function onError(error: Error) {
  console.error('ChatEditor error:', error)
}

export function ChatEditor() {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [MentionNode]
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={
            <div className="editor-placeholder">Enter your message...</div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MentionPlugin />
      </div>
    </LexicalComposer>
  )
}
