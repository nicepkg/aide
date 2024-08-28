import * as React from 'react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { createQueryClient } from '@webview/api/react-query/query-client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { Toaster } from 'sonner'

export function Providers({ children }: React.PropsWithChildren) {
  const queryClientRef = React.useRef<QueryClient>()
  if (!queryClientRef.current) {
    queryClientRef.current = createQueryClient()
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <QueryClientProvider client={queryClientRef.current}>
          {children}
        </QueryClientProvider>
      </TooltipProvider>
      <Toaster />
    </NextThemesProvider>
  )
}
