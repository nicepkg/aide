import React from 'react'
import { TruncateStart } from '@webview/components/truncate-start'

export interface MentionItemLayoutProps {
  icon: React.ReactNode
  label: string
  details?: React.ReactNode
}

export const MentionItemLayout: React.FC<MentionItemLayoutProps> = ({
  icon,
  label,
  details
}) => (
  <div className="flex items-center w-full">
    <div className="flex-shrink-0 flex items-center mr-2">
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </div>
    {details && <TruncateStart>{details}</TruncateStart>}
  </div>
)
