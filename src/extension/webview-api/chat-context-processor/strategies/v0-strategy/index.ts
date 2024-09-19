/* eslint-disable @typescript-eslint/no-useless-constructor */
import type { BaseStrategy } from '../base-strategy'
import { ChatStrategy } from '../chat-strategy'

export class V0Strategy extends ChatStrategy implements BaseStrategy {
  constructor() {
    super()
  }
}
