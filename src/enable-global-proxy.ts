import { bootstrap } from 'global-agent'
import { ProxyAgent, setGlobalDispatcher } from 'undici'

import { logger } from './logger'

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

export const enableGlobalProxy = () => {
  try {
    const proxyUrl = getDefaultProxyUrl()

    bootstrap()

    if (proxyUrl) {
      const dispatcher = new ProxyAgent(proxyUrl)
      setGlobalDispatcher(dispatcher)
    }
  } catch (err) {
    logger.log('Failed to enable global proxy', err)
  }
}
