import { bootstrap } from 'global-agent'
import { ProxyAgent, setGlobalDispatcher } from 'undici'

function getDefaultProxyUrl() {
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
  const proxyUrl = getDefaultProxyUrl()

  bootstrap()
  const dispatcher = new ProxyAgent(proxyUrl)
  setGlobalDispatcher(dispatcher)

  return dispatcher
}
