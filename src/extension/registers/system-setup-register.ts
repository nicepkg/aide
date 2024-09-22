import { getConfigKey } from '@extension/config'
import { logger } from '@extension/logger'
import { enablePolyfill } from '@extension/polyfill'
import { getIsDev, tryParseJSON } from '@extension/utils'
import { bootstrap } from 'global-agent'
import { ProxyAgent, setGlobalDispatcher } from 'undici'

import { BaseRegister } from './base-register'

export class SystemSetupRegister extends BaseRegister {
  async register(): Promise<void> {
    await this.setupPolyfill()
    await this.setupSystemProxy()
    await this.setupLogFetch()
  }

  private async setupPolyfill(): Promise<void> {
    await enablePolyfill()
  }

  private async setupSystemProxy(): Promise<void> {
    try {
      const useSystemProxy = await getConfigKey('useSystemProxy')
      if (!useSystemProxy) return

      const proxyUrl = this.getDefaultProxyUrl()

      bootstrap()

      if (proxyUrl) {
        const dispatcher = new ProxyAgent(proxyUrl)
        setGlobalDispatcher(dispatcher)
      }
    } catch (err) {
      logger.warn('Failed to enable global proxy', err)
    }
  }

  private setupLogFetch(): void {
    const isDev = getIsDev()

    if (!isDev) return

    const originalFetch = globalThis.fetch
    const logFetch: typeof globalThis.fetch = (input, init) => {
      const reqBody =
        typeof init?.body === 'string'
          ? tryParseJSON(init.body) || init.body
          : init?.body

      logger.dev.log('fetching...', {
        input,
        init,
        url: input.toString(),
        method: init?.method || 'GET',
        headers: init?.headers || {},
        body: reqBody
      })

      return originalFetch(input, init)
    }
    globalThis.fetch = logFetch
  }

  private getDefaultProxyUrl(): string {
    let proxyUrl = ''

    ;['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY'].forEach(key => {
      if (proxyUrl) return

      const upperKey = key.toUpperCase()
      const lowerKey = key.toLowerCase()
      const upperKeyValue =
        process.env[upperKey] && process.env[upperKey] !== 'undefined'
          ? process.env[upperKey] || ''
          : ''
      const lowerKeyValue =
        process.env[lowerKey] && process.env[lowerKey] !== 'undefined'
          ? process.env[lowerKey] || ''
          : ''

      proxyUrl = upperKeyValue || lowerKeyValue || ''
    })

    return proxyUrl
  }
}
