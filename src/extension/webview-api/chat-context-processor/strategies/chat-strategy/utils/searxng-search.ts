import type { WebSearchResult } from '@webview/types/chat'
import * as cheerio from 'cheerio'

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
      content: $(element).find('.content').text().trim()
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
    apiBase = 'https://searx.tiekoetter.com',
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
      headers: { ...headers },
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
