import type { Metadata } from './metadata'

export interface Mention {
  detail: number
  format: number
  mode: 'segmented'
  style: string
  text: string
  type: 'mention'
  version: number
  mentionName: string
  storedKey: string
  metadata: Metadata
}
