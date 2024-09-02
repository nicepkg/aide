import type { EditorThemeClasses } from 'lexical'

import './normal.css'

export const normalTheme: EditorThemeClasses = {
  blockCursor: 'lexicalEditorTheme__blockCursor',
  characterLimit: 'lexicalEditorTheme__characterLimit',
  code: 'lexicalEditorTheme__code',
  codeHighlight: {
    atrule: 'lexicalEditorTheme__tokenAttr',
    attr: 'lexicalEditorTheme__tokenAttr',
    boolean: 'lexicalEditorTheme__tokenProperty',
    builtin: 'lexicalEditorTheme__tokenSelector',
    cdata: 'lexicalEditorTheme__tokenComment',
    char: 'lexicalEditorTheme__tokenSelector',
    class: 'lexicalEditorTheme__tokenFunction',
    'class-name': 'lexicalEditorTheme__tokenFunction',
    comment: 'lexicalEditorTheme__tokenComment',
    constant: 'lexicalEditorTheme__tokenProperty',
    deleted: 'lexicalEditorTheme__tokenProperty',
    doctype: 'lexicalEditorTheme__tokenComment',
    entity: 'lexicalEditorTheme__tokenOperator',
    function: 'lexicalEditorTheme__tokenFunction',
    important: 'lexicalEditorTheme__tokenVariable',
    inserted: 'lexicalEditorTheme__tokenSelector',
    keyword: 'lexicalEditorTheme__tokenAttr',
    namespace: 'lexicalEditorTheme__tokenVariable',
    number: 'lexicalEditorTheme__tokenProperty',
    operator: 'lexicalEditorTheme__tokenOperator',
    prolog: 'lexicalEditorTheme__tokenComment',
    property: 'lexicalEditorTheme__tokenProperty',
    punctuation: 'lexicalEditorTheme__tokenPunctuation',
    regex: 'lexicalEditorTheme__tokenVariable',
    selector: 'lexicalEditorTheme__tokenSelector',
    string: 'lexicalEditorTheme__tokenSelector',
    symbol: 'lexicalEditorTheme__tokenProperty',
    tag: 'lexicalEditorTheme__tokenProperty',
    url: 'lexicalEditorTheme__tokenOperator',
    variable: 'lexicalEditorTheme__tokenVariable'
  },
  embedBlock: {
    base: 'lexicalEditorTheme__embedBlock',
    focus: 'lexicalEditorTheme__embedBlockFocus'
  },
  hashtag: 'lexicalEditorTheme__hashtag',
  heading: {
    h1: 'lexicalEditorTheme__h1',
    h2: 'lexicalEditorTheme__h2',
    h3: 'lexicalEditorTheme__h3',
    h4: 'lexicalEditorTheme__h4',
    h5: 'lexicalEditorTheme__h5',
    h6: 'lexicalEditorTheme__h6'
  },
  image: 'editor-image',
  indent: 'lexicalEditorTheme__indent',
  inlineImage: 'inline-editor-image',
  layoutContainer: 'lexicalEditorTheme__layoutContainer',
  layoutItem: 'lexicalEditorTheme__layoutItem',
  link: 'lexicalEditorTheme__link',
  list: {
    checklist: 'lexicalEditorTheme__checklist',
    listitem: 'lexicalEditorTheme__listItem',
    listitemChecked: 'lexicalEditorTheme__listItemChecked',
    listitemUnchecked: 'lexicalEditorTheme__listItemUnchecked',
    nested: {
      listitem: 'lexicalEditorTheme__nestedListItem'
    },
    olDepth: [
      'lexicalEditorTheme__ol1',
      'lexicalEditorTheme__ol2',
      'lexicalEditorTheme__ol3',
      'lexicalEditorTheme__ol4',
      'lexicalEditorTheme__ol5'
    ],
    ul: 'lexicalEditorTheme__ul'
  },
  ltr: 'lexicalEditorTheme__ltr',
  mark: 'lexicalEditorTheme__mark',
  markOverlap: 'lexicalEditorTheme__markOverlap',
  paragraph: 'lexicalEditorTheme__paragraph',
  quote: 'lexicalEditorTheme__quote',
  rtl: 'lexicalEditorTheme__rtl',
  table: 'lexicalEditorTheme__table',
  tableAddColumns: 'lexicalEditorTheme__tableAddColumns',
  tableAddRows: 'lexicalEditorTheme__tableAddRows',
  tableCell: 'lexicalEditorTheme__tableCell',
  tableCellActionButton: 'lexicalEditorTheme__tableCellActionButton',
  tableCellActionButtonContainer:
    'lexicalEditorTheme__tableCellActionButtonContainer',
  tableCellEditing: 'lexicalEditorTheme__tableCellEditing',
  tableCellHeader: 'lexicalEditorTheme__tableCellHeader',
  tableCellPrimarySelected: 'lexicalEditorTheme__tableCellPrimarySelected',
  tableCellResizer: 'lexicalEditorTheme__tableCellResizer',
  tableCellSelected: 'lexicalEditorTheme__tableCellSelected',
  tableCellSortedIndicator: 'lexicalEditorTheme__tableCellSortedIndicator',
  tableResizeRuler: 'lexicalEditorTheme__tableCellResizeRuler',
  tableSelected: 'lexicalEditorTheme__tableSelected',
  tableSelection: 'lexicalEditorTheme__tableSelection',
  text: {
    bold: 'lexicalEditorTheme__textBold',
    code: 'lexicalEditorTheme__textCode',
    italic: 'lexicalEditorTheme__textItalic',
    strikethrough: 'lexicalEditorTheme__textStrikethrough',
    subscript: 'lexicalEditorTheme__textSubscript',
    superscript: 'lexicalEditorTheme__textSuperscript',
    underline: 'lexicalEditorTheme__textUnderline',
    underlineStrikethrough: 'lexicalEditorTheme__textUnderlineStrikethrough'
  }
}
