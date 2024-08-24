import type { MentionType } from './mention-type'
import type { SelectionType } from './selection-type'

export interface Metadata {
  selection: {
    type: SelectionType
    selectionWithoutUuid?: any // This could be further typed based on specific selection types
  }
  selectedOption: {
    key: string
    type: MentionType
    score: number
    name: string
    picture: Record<string, unknown>
    secondaryText?: string
    selectionPrecursor?: any
    docSelection?: {
      docId: string
      name: string
      url: string
    }
    diff?: string
  }
}
