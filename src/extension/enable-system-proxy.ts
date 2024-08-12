import { bootstrap } from 'global-agent'
import { ProxyAgent, setGlobalDispatcher } from 'undici'

import { getConfigKey } from './config'
import { logger } from './logger'
import { tryParseJSON } from './utils'

const getDefaultProxyUrl = () => {
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

export const enableSystemProxy = async () => {
  try {
    const useSystemProxy = await getConfigKey('useSystemProxy')
    if (!useSystemProxy) return

    const proxyUrl = getDefaultProxyUrl()

    bootstrap()

    if (proxyUrl) {
      const dispatcher = new ProxyAgent(proxyUrl)
      setGlobalDispatcher(dispatcher)
    }
  } catch (err) {
    logger.warn('Failed to enable global proxy', err)
  }
}

export const enableLogFetch = () => {
  const originalFetch = globalThis.fetch
  const logFetch: typeof globalThis.fetch = (input, init) => {
    const reqBody =
      typeof init?.body === 'string'
        ? tryParseJSON(init.body, true)
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
