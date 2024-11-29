import { DotFilledIcon } from '@radix-ui/react-icons'
import { TruncateStart } from '@webview/components/truncate-start'
import type { MentionOption } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { ChevronRightIcon, SquareTerminalIcon } from 'lucide-react'

import type { TerminalInfo } from '../types'

export const MentionTerminalPreview: React.FC<
  MentionOption
> = mentionOption => {
  const terminalInfo = mentionOption.data as TerminalInfo

  return (
    <div className="flex flex-col w-full h-[50vh] overflow-hidden">
      {/* Terminal Header - macOS style */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground text-sm border-b">
        <SquareTerminalIcon className="size-4" />
        {terminalInfo.name}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-4 font-mono">
          {terminalInfo.commands.map((command, index) => (
            <div key={index} className="space-y-1">
              {/* Current Working Directory */}
              {command.cwd && (
                <div className="flex gap-2 text-xs text-muted-foreground/80">
                  <ChevronRightIcon className="size-3.5" />
                  <TruncateStart>{command.cwd}</TruncateStart>
                </div>
              )}

              {/* Command Input */}
              <div className="flex items-start gap-2 text-sm">
                <ChevronRightIcon className="size-3.5 text-primary select-none" />
                <span className="text-foreground/90">{command.input}</span>
              </div>

              {/* Command Output */}
              {command.output && (
                <div
                  className={cn(
                    'pl-4 text-sm',
                    'whitespace-pre-wrap break-all',
                    command.exitCode === 0
                      ? 'text-foreground/80'
                      : 'text-destructive/90'
                  )}
                >
                  {command.output}
                </div>
              )}

              {/* Exit Code Badge */}
              {command.exitCode !== 0 && (
                <div className="pl-4">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-destructive/10 text-destructive border border-destructive/20">
                    <DotFilledIcon className="size-3" />
                    Exit {command.exitCode}
                  </span>
                </div>
              )}
            </div>
          ))}

          {terminalInfo.commands.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No command history
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
