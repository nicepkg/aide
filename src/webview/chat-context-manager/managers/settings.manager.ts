import type { ISettingsContext } from '@extension/webview-api/chat-context-builder/types/chat-context'

import { BaseContextManager } from './base.manager'

export class SettingsContextManager extends BaseContextManager<ISettingsContext> {
  constructor() {
    super({
      modelName: '',
      useFastApply: false,
      useChunkSpeculationForLongFiles: false,
      explicitContext: { context: '' },
      clickedCodeBlockContents: '',
      allowLongFileScan: false
    })
  }
}
