import { Suspense } from 'react'
import routes from '~react-pages'
import { AnimatePresence } from 'framer-motion'
import { useLocation, useRoutes } from 'react-router-dom'

import { AppErrorBoundary } from './components/error-boundary'
import { LoadingSpinner } from './components/loading-spinner'
import { PageTransition } from './components/page-transition'
import { Providers } from './contexts/providers'
import { usePageTransition } from './hooks/use-page-transition'

export default function App() {
  const location = useLocation()
  const element = useRoutes(routes)
  const direction = usePageTransition()

  return (
    <div className="h-full">
      <Providers>
        <AppErrorBoundary>
          <div className="flex min-h-screen flex-col h-full">
            <main className="flex flex-1 flex-col h-full relative">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center w-full h-full">
                    <LoadingSpinner />
                  </div>
                }
              >
                <AnimatePresence initial={false}>
                  <PageTransition
                    pathname={location.pathname}
                    direction={direction}
                  >
                    {element}
                  </PageTransition>
                </AnimatePresence>
              </Suspense>
            </main>
          </div>
        </AppErrorBoundary>
      </Providers>
    </div>
  )
}
