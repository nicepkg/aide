// this file is for Aide third-party API query
type BaseRes<T = any> = {
  success: boolean
  data: T
  message: string
}

type AideKeyUsageSearchParams = {
  key: string
  p: number // page
  pageSize: number
}

type AideKeyUsageSearchResDataItem = {
  id: number
  request_id: string
  user_id: number
  created_at: number
  type: number
  content: string
  username: string
  token_name: string
  model_name: string
  channel_name: string
  quota: number
  prompt_tokens: number
  completion_tokens: number
  channel: number
  token_key: string
  request_duration: number
  response_first_byte_duration: number
  total_duration: number
  duration_for_view: number
  is_stream: boolean
  ip: string
}

type AideKeyUsageSearchRes = BaseRes<{
  total: number
  data: AideKeyUsageSearchResDataItem[]
}>

export const aideKeyUsageSearch = (params: AideKeyUsageSearchParams) =>
  fetch(
    `https://api.zyai.online/public/log/self/search?key=${params.key}&p=${params.p}&pageSize=${params.pageSize}`,
    {
      method: 'GET'
    }
  ).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json() as Promise<AideKeyUsageSearchRes>
  })

type AideKeyUsageCountParams = {
  key: string
}

type AideKeyUsageCountResData = {
  count: number
}

type AideKeyUsageCountRes = BaseRes<AideKeyUsageCountResData>

export const aideKeyUsageCount = (params: AideKeyUsageCountParams) =>
  fetch(`https://api.zyai.online/public/log/self/count?key=${params.key}`, {
    method: 'GET'
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json() as Promise<AideKeyUsageCountRes>
  })

type AideKeyUsageStatParams = {
  key: string
}

type AideKeyUsageStatResData = {
  mpm: number
  quota: number
  rpm: number
  tpm: number
}

type AideKeyUsageStatRes = BaseRes<AideKeyUsageStatResData>

export const aideKeyUsageStat = (params: AideKeyUsageStatParams) =>
  fetch(`https://api.zyai.online/public/log/self/stat?key=${params.key}`, {
    method: 'GET'
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json() as Promise<AideKeyUsageStatRes>
  })

export type AideKeyUsageSubscriptionParams = {
  key: string
}

export type AideKeyUsageSubscriptionRes = {
  object: string
  has_payment_method: boolean
  soft_limit_usd: number
  hard_limit_usd: number
  system_hard_limit_usd: number
  access_until: number
  used_quota: number
  remain_quota: number
  used_count: number
}

export const aideKeyUsageSubscription = (
  params: AideKeyUsageSubscriptionParams
) =>
  fetch(`https://api.zyai.online/public/dashboard/billing/subscription`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${params.key}`
    }
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json() as Promise<AideKeyUsageSubscriptionRes>
  })

type AideKeyUsageInfoParams = {
  key: string
}

type AideKeyUsageInfoResData = {
  count: AideKeyUsageCountResData
  subscription: AideKeyUsageSubscriptionRes
}

type AideKeyUsageInfoRes = BaseRes<AideKeyUsageInfoResData>

export const aideKeyUsageInfo = (
  params: AideKeyUsageInfoParams
): Promise<AideKeyUsageInfoRes> =>
  Promise.all([aideKeyUsageCount(params), aideKeyUsageSubscription(params)])
    .then(([countRes, subscriptionRes]) => ({
      success: countRes.success,
      data: {
        count: countRes.data,
        subscription: subscriptionRes
      },
      message: 'Combined usage info retrieved successfully'
    }))
    .catch(error => ({
      success: false,
      data: {
        count: { count: 0 },
        subscription: {
          object: '',
          has_payment_method: false,
          soft_limit_usd: 0,
          hard_limit_usd: 0,
          system_hard_limit_usd: 0,
          access_until: 0,
          used_quota: 0,
          remain_quota: 0,
          used_count: 0
        }
      },
      message: `Error fetching usage info: ${error.message}`
    }))
