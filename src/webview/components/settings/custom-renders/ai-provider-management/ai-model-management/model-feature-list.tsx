import { useState } from 'react'
import {
  CheckIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  ReloadIcon,
  UpdateIcon
} from '@radix-ui/react-icons'
import {
  aiModelFeatures,
  type AIModel,
  type AIModelFeature
} from '@shared/entities'
import { Button } from '@webview/components/ui/button'

interface ModelFeatureListProps {
  model: AIModel
  onTest: (model: AIModel, features: AIModelFeature[]) => void
}

export const ModelFeatureList = ({ model, onTest }: ModelFeatureListProps) => {
  const [isTestLoading, setIsTestLoading] = useState<Record<string, boolean>>(
    {}
  )

  const handleTestFeature = async (feature: AIModelFeature) => {
    setIsTestLoading(prev => ({ ...prev, [feature]: true }))
    try {
      await onTest(model, [feature])
    } finally {
      setIsTestLoading(prev => ({ ...prev, [feature]: false }))
    }
  }

  const handleTestAll = async () => {
    setIsTestLoading(prev => ({
      ...prev,
      ...aiModelFeatures.reduce((acc, f) => ({ ...acc, [f]: true }), {})
    }))
    try {
      await onTest(model, aiModelFeatures)
    } finally {
      setIsTestLoading(prev => ({
        ...prev,
        ...aiModelFeatures.reduce((acc, f) => ({ ...acc, [f]: false }), {})
      }))
    }
  }

  const getFeatureIcon = (feature: AIModelFeature) => {
    if (isTestLoading[feature]) {
      return (
        <ReloadIcon className="size-4 animate-spin text-muted-foreground" />
      )
    }

    const support = model[feature]
    if (support === 'unknown') {
      return <ExclamationTriangleIcon className="size-4 text-foreground" />
    }
    if (support === true) {
      return <CheckIcon className="size-4 text-primary" />
    }
    return <Cross2Icon className="size-4 text-destructive" />
  }

  return (
    <div className="space-y-2 pt-2">
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleTestAll}
        disabled={Object.values(isTestLoading).some(Boolean)}
      >
        Test All Features
      </Button>

      <div className="space-y-1">
        {aiModelFeatures.map(feature => (
          <div key={feature} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              {getFeatureIcon(feature)}
              <span className="text-sm">{feature}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={isTestLoading[feature]}
              onClick={() => handleTestFeature(feature)}
            >
              <UpdateIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
