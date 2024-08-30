import {
  $applyNodeReplacement,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  TextNode
} from 'lexical'

export type SerializedMentionNode = SerializedTextNode & {
  mentionType: string
  mentionData: any
}

export class MentionNode extends TextNode {
  __mentionType: string

  __mentionData: any

  static getType(): string {
    return 'mention'
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(
      node.__mentionType,
      node.__mentionData,
      node.__text,
      node.__key
    )
  }

  constructor(
    mentionType: string,
    mentionData: any,
    text?: string,
    key?: NodeKey
  ) {
    super(text || `@${mentionType}`, key)
    this.__mentionType = mentionType
    this.__mentionData = mentionData
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config)
    dom.style.cssText =
      'background-color: hsl(var(--primary)); font-size: 12px; border-radius: 4px; padding: 0 2px; margin: 1px 1px; color: hsl(var(--primary-foreground)); display: inline-block;'
    dom.className = 'mention'
    dom.setAttribute('data-mention', 'true')
    dom.setAttribute('spellcheck', 'false')
    dom.setAttribute('contentEditable', 'false')
    return dom
  }

  updateDOM(
    prevNode: MentionNode,
    dom: HTMLElement,
    config: EditorConfig
  ): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config)
    return isUpdated
  }

  isSegmented(): boolean {
    return true
  }

  isInline(): boolean {
    return true
  }

  isKeyboardSelectable(): boolean {
    return true
  }

  canInsertTextBefore(): boolean {
    return false
  }

  canInsertTextAfter(): boolean {
    return false
  }

  splitText(): TextNode[] {
    return [this]
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(
      serializedNode.mentionType,
      serializedNode.mentionData
    )
    node.setTextContent(serializedNode.text)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionType: this.__mentionType,
      mentionData: this.__mentionData,
      type: 'mention',
      version: 1
    }
  }
}

export function $createMentionNode(
  mentionType: string,
  mentionData: any
): MentionNode {
  const mentionNode = new MentionNode(mentionType, mentionData)
  return $applyNodeReplacement(mentionNode)
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode
}
