import { AlertTriangle } from 'lucide-react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog'
import { Button } from './ui/button'

interface FallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Something went wrong!</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2">
            <div className="text-sm text-destructive mb-4">{error.message}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="destructive" onClick={resetErrorBoundary}>
            Try again
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Reusable ErrorBoundary component
export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Optional: Reset the app state here
        window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
