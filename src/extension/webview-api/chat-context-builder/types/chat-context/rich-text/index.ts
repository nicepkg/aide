import type { Mention } from './mention'

export interface RichTextTextNode {
  detail: number
  format: number
  mode: 'normal' | 'segmented'
  style: string
  text: string
  type: 'text'
  version: number
}

export type RichTextContentNode = Mention | RichTextTextNode

export interface RichTextParagraph {
  children: RichTextContentNode[]
  direction: 'ltr'
  format: string
  indent: number
  type: 'paragraph'
  version: number
}

export interface RichTextRootNode {
  children: RichTextParagraph[]
  direction: 'ltr'
  format: string
  indent: number
  type: 'root'
  version: number
}

export interface RichText {
  root: RichTextRootNode
}
