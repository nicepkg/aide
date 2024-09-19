import React, { type FC, type ReactNode } from 'react'
import { CopyIcon } from '@radix-ui/react-icons'
import { CollapsibleCode } from '@webview/components/collapsible-code'
import { Button } from '@webview/components/ui/button'
import { toast } from 'sonner'

import { useMermaid } from './use-mermaid'

export interface MermaidProps extends React.HTMLAttributes<HTMLDivElement> {
  bodyRender?: (props: {
    content: string
    originalNode: ReactNode
  }) => ReactNode
  children: string
  defaultExpanded?: boolean
}

export const Mermaid: FC<MermaidProps> = ({
  children,
  style,
  className = '',
  bodyRender,
  ...rest
}) => {
  const MermaidRender = useMermaid(children)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children)
    toast.success('Mermaid code copied to clipboard')
  }

  const defaultBody = <MermaidRender />

  const body = bodyRender
    ? bodyRender({ content: children, originalNode: defaultBody })
    : defaultBody

  const actions = (
    <Button
      className="transition-colors"
      onClick={copyToClipboard}
      size="iconXss"
      variant="ghost"
      aria-label="Copy mermaid code"
    >
      <CopyIcon className="size-3" />
    </Button>
  )

  return (
    <CollapsibleCode
      title="mermaid"
      actions={actions}
      className={className}
      {...rest}
    >
      <div className="overflow-auto w-full h-full" style={style}>
        {body}
      </div>
    </CollapsibleCode>
  )
}
