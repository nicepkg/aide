import React, { useEffect, useState } from 'react'
import type { FileInfo } from '@extension/file-utils/traverse-fs'
import type { GitCommit } from '@extension/webview-api/chat-context-processor/types/chat-context/git-context'
import { allMentionStrategies } from '@webview/lexical/mentions'

interface MentionSelectorProps {
  isOpen: boolean
  onSelect: (type: string, data: any) => void
  onClose: () => void
}

export const MentionSelector: React.FC<MentionSelectorProps> = ({
  isOpen,
  onSelect,
  onClose
}) => {
  const [activeType, setActiveType] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && activeType) {
      const strategy = allMentionStrategies.find(s => s.type === activeType)
      if (strategy) {
        setLoading(true)
        setError(null)
        strategy
          .getData()
          .then(data => {
            setItems(data)
            setLoading(false)
          })
          .catch(err => {
            console.error('Error fetching data:', err)
            setError('Failed to load data')
            setLoading(false)
          })
      }
    }
  }, [isOpen, activeType])

  if (!isOpen) return null

  return (
    <div className="mention-selector">
      <div className="mention-types">
        {allMentionStrategies.map(strategy => (
          <button
            key={strategy.type}
            onClick={() => setActiveType(strategy.type)}
            className={activeType === strategy.type ? 'active' : ''}
          >
            {strategy.type}
          </button>
        ))}
      </div>
      <div className="mention-items">
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading &&
          !error &&
          items.map((item, index) => (
            <div
              key={index}
              className="mention-item"
              onClick={() => {
                onSelect(activeType!, item)
                onClose()
              }}
            >
              {/* Render item based on its type */}
              {activeType === 'file' && (item as FileInfo).relativePath}
              {activeType === 'gitCommit' && (item as GitCommit).message}
              {/* Add more type-specific rendering logic here */}
            </div>
          ))}
      </div>
    </div>
  )
}
