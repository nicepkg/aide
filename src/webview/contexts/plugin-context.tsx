import React from 'react'
import { ClientPluginProvider } from '@shared/plugins/base/client/client-plugin-context'
import { createClientPlugins } from '@shared/plugins/base/client/create-client-plugins'
import type { ClientPlugin } from '@shared/plugins/base/client/use-client-plugin'

export { usePlugin } from '@shared/plugins/base/client/client-plugin-context'

const Plugin: React.FC<{ plugin: ClientPlugin }> = ({ plugin }) => {
  plugin.usePlugin()
  return null
}

export const PluginProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => (
  <ClientPluginProvider>
    {createClientPlugins().map(plugin => (
      <Plugin key={plugin.id} plugin={plugin} />
    ))}
    {children}
  </ClientPluginProvider>
)

export const WithPluginProvider = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithPluginProvider: React.FC<P> = props => (
    <PluginProvider>
      <WrappedComponent {...props} />
    </PluginProvider>
  )

  WithPluginProvider.displayName = `WithPluginProvider(${getDisplayName(
    WrappedComponent
  )})`

  return WithPluginProvider
}

function getDisplayName<P>(WrappedComponent: React.ComponentType<P>): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
