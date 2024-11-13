/* eslint-disable react-compiler/react-compiler */
import { useRef } from 'react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { Toaster } from '@webview/components/ui/sonner'
import { createQueryClient } from '@webview/services/react-query/query-client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

import { ChatContextProvider } from './chat-context'
import { GlobalSearchProvider } from './global-search-context'

export const Providers = ({ children }: React.PropsWithChildren) => {
  const queryClientRef = useRef<QueryClient>(null)
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
      <Toaster position="top-center" />
      <TooltipProvider>
        <QueryClientProvider client={queryClientRef.current}>
          <ChatContextProvider>
            <GlobalSearchProvider>{children}</GlobalSearchProvider>
          </ChatContextProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </NextThemesProvider>
  )
}
