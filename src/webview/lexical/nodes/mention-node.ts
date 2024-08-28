import { EditorConfig, NodeKey, SerializedTextNode, TextNode } from 'lexical'

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
    // dom.style.cssText =
    //   'background-color: #eee; border-radius: 3px; padding: 1px 3px;'
    // dom.className = 'mention'

    dom.style.cssText =
      'background-color: #e6f3ff; border-radius: 3px; padding: 1px 3px; color: #0366d6; font-weight: 500;'
    dom.className = 'mention'

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

  getMentionType(): string {
    return this.__mentionType
  }

  getMentionData(): any {
    return this.__mentionData
  }
}

export function $createMentionNode(
  mentionType: string,
  mentionData: any
): MentionNode {
  return new MentionNode(mentionType, mentionData)
}

export function $isMentionNode(node: any): node is MentionNode {
  return node instanceof MentionNode
}
