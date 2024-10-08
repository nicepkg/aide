import * as cheerio from 'cheerio'

import { ContextInfoSource, type WebSearchResult } from '../types/chat-context'
import { getRandomHeaders } from './fake-request-headers'

interface SearxngSearchOptions {
  apiBase: string
  params?: SearxngSearchParams
  headers?: SearxngCustomHeaders
}

interface SearxngSearchParams {
  numResults?: number
  categories?: string
  engines?: string
  language?: string
  pageNumber?: number
  timeRange?: number
  format?: 'json'
  resultsOnNewTab?: 0 | 1
  imageProxy?: boolean
  autocomplete?: string
  safesearch?: 0 | 1 | 2
}

interface SearxngCustomHeaders {
  [key: string]: string
}

interface SearxngResults {
  query: string
  results: WebSearchResult[]
  answers: string[]
  infoboxes: { content: string }[]
  suggestions: string[]
}

const parseHtml = (htmlContent: string): SearxngResults => {
  const $ = cheerio.load(htmlContent)

  const results: WebSearchResult[] = $('.result')
    .map((_, element) => ({
      title: $(element).find('h3').text().trim(),
      url: $(element).find('a').attr('href') || '',
      content: $(element).find('.content').text().trim(),
      source: ContextInfoSource.ToolNode
    }))
    .get()

  const answers = $('.answer')
    .map((_, element) => $(element).text().trim())
    .filter((_, text) => text.length > 0)
    .get()

  const infoboxes = $('.infobox')
    .map((_, element) => ({
      content: $(element).text().trim()
    }))
    .filter((_, text) => text.content.length > 0)
    .get()

  const suggestions = $('.suggestion')
    .map((_, element) => $(element).text().trim())
    .filter((_, text) => text.length > 0)
    .get()

  return {
    query: $('input[name="q"]').val() as string,
    results,
    answers,
    infoboxes,
    suggestions
  }
}

export const searxngSearch = async (
  input: string,
  options?: SearxngSearchOptions
): Promise<SearxngResults> => {
  const {
    apiBase = 'https://search.hbubli.cc',
    params = {},
    headers = {}
  } = options || {}

  if (!apiBase) {
    throw new Error(
      'SEARXNG_API_BASE not set. You can set it as "SEARXNG_API_BASE" in your environment variables.'
    )
  }

  const defaultParams: SearxngSearchParams = {
    numResults: 10,
    pageNumber: 1,
    imageProxy: true,
    safesearch: 0,
    engines: 'google'
  }

  const queryParams = {
    q: input,
    ...defaultParams,
    ...params
  } as SearxngSearchParams

  const searchParams = new URLSearchParams(queryParams as any)
  const url = `${apiBase}/search?${searchParams}`

  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        ...getRandomHeaders(),
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        ...headers
      },
      signal: AbortSignal.timeout(5 * 1000)
    })

    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`)
    }

    const htmlContent = await resp.text()
    const res = parseHtml(htmlContent)

    return res
  } catch (error) {
    console.error('Error during searxng search:', error)
    return {
      query: input,
      results: [],
      answers: [],
      infoboxes: [],
      suggestions: []
    }
  }
}
