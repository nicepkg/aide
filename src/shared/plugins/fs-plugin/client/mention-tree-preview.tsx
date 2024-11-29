import { FC } from 'react'
import { ScrollArea } from '@webview/components/ui/scroll-area'
import type { MentionOption } from '@webview/types/chat'

import type { TreeInfo } from '../types'

export const MentionTreePreview: FC<MentionOption> = mentionOption => {
  const treeInfo = mentionOption.data as TreeInfo

  return (
    <div className="flex flex-col h-full max-h-[40vh]">
      <ScrollArea className="h-full overflow-y-auto">
        <pre className="p-2 text-xs">{treeInfo.treeString}</pre>
      </ScrollArea>
    </div>
  )
}
