import { BaseToState } from '../base/base-to-state'
import { TerminalMentionType, type TerminalMention } from './types'

export class TerminalToState extends BaseToState<TerminalMention> {
  toMentionsState() {
    return {
      selectedTerminals: this.getMentionDataByType(TerminalMentionType.Terminal)
    }
  }

  toAgentsState() {
    return {}
  }
}
