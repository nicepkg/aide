import crypto from 'crypto'

export const getRandomHeaders = () => {
  const randomIP = generateRandomIP()
  const randomUserAgent = generateRandomChromeUserAgent()
  const headers = {
    'User-Agent': randomUserAgent,

    'X-Forwarded-For': randomIP,
    'X-Forwarded-Proto': 'https',
    // 'X-Forwarded-Host': generateRandomDomain(),
    'X-Real-IP': randomIP,
    'X-Forwarded-IP': randomIP,

    'X-Requested-With': 'XMLHttpRequest',
    DNT: Math.random() < 0.5 ? '1' : '0',
    Connection: 'keep-alive'
  }

  return headers
}

export const generateRandomIP = () =>
  Array(4)
    .fill(0)
    .map(() => Math.floor(Math.random() * 256))
    .join('.')

export const generateRandomDomain = () => {
  const tlds = ['com', 'org', 'net', 'io', 'co', 'us', 'ru', 'de', 'uk']
  const domain = crypto.randomBytes(8).toString('hex')
  const tld = tlds[Math.floor(Math.random() * tlds.length)]
  return `${domain}.${tld}`
}

export const generateRandomChromeUserAgent = () => {
  const chromeVersions = [
    '90',
    '91',
    '92',
    '93',
    '94',
    '95',
    '96',
    '97',
    '98',
    '99',
    '100',
    '101',
    '102',
    '103',
    '104',
    '105'
  ]
  const osVersions = ['10.0', '11.0']

  const chromeVersion =
    chromeVersions[Math.floor(Math.random() * chromeVersions.length)]
  const osVersion = osVersions[Math.floor(Math.random() * osVersions.length)]

  return `Mozilla/5.0 (Windows NT ${osVersion}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.${Math.floor(Math.random() * 9999)}.0 Safari/537.36`
}
