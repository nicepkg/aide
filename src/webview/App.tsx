import { Suspense } from 'react'
import routes from '~react-pages'
import { useRoutes } from 'react-router-dom'

import './styles/global.css'

import { LoadingSpinner } from './components/loading-spinner'
import { ThemeSync } from './components/theme-sync'
import { Providers } from './contexts/providers'

export default function App() {
  return (
    <div className="h-full">
      <Providers>
        <div className="flex min-h-screen flex-col h-full">
          <main className="flex flex-1 flex-col h-full">
            <Suspense
              fallback={
                <div className="flex items-center justify-center w-full h-full">
                  <LoadingSpinner />
                </div>
              }
            >
              {useRoutes(routes)}
            </Suspense>
          </main>
        </div>
        {/* <TailwindIndicator /> */}
      </Providers>
      <ThemeSync />
    </div>
  )
}
