import { ChevronRightIcon } from '@radix-ui/react-icons'
import { FileIcon } from '@webview/components/file-icon'
import { TruncateStart } from '@webview/components/truncate-start'
import type { MentionOption } from '@webview/types/chat'

export const MentionFolderItem: React.FC<MentionOption> = mentionOption => (
  <div className="flex items-center w-full">
    <div className="flex-shrink-0 flex items-center mr-2">
      <ChevronRightIcon className="size-4 mr-1" />
      <FileIcon
        className="size-4 mr-1"
        isFolder
        isOpen={false}
        filePath={mentionOption.data.relativePath}
      />
      <span className="whitespace-nowrap">{mentionOption.label}</span>
    </div>
    <TruncateStart>{mentionOption.data.relativePath}</TruncateStart>
  </div>
)
