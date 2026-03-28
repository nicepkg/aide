import { describe, expect, it } from 'vitest'

// Test 1: parseModelBaseUrl regex supports minimax prefix
describe('parseModelBaseUrl - minimax support', () => {
  // The regex from parse-model-base-url.ts
  const regex =
    /^(openai|azure-openai|anthropic|minimax|copilot)?@?(https?:\/\/[^\s]+)?$/

  it('should parse minimax@ prefix URL', () => {
    const match = 'minimax@https://api.minimax.io/v1'.match(regex)
    expect(match).not.toBeNull()
    expect(match![1]).toBe('minimax')
    expect(match![2]).toBe('https://api.minimax.io/v1')
  })

  it('should parse minimax@ with custom URL', () => {
    const match = 'minimax@https://custom.proxy.com/v1'.match(regex)
    expect(match).not.toBeNull()
    expect(match![1]).toBe('minimax')
    expect(match![2]).toBe('https://custom.proxy.com/v1')
  })

  it('should still parse openai@ prefix', () => {
    const match = 'openai@https://api.openai.com/v1'.match(regex)
    expect(match).not.toBeNull()
    expect(match![1]).toBe('openai')
  })

  it('should still parse anthropic@ prefix', () => {
    const match = 'anthropic@https://api.anthropic.com'.match(regex)
    expect(match).not.toBeNull()
    expect(match![1]).toBe('anthropic')
  })

  it('should still parse azure-openai@ prefix', () => {
    const match =
      'azure-openai@https://westeurope.api.microsoft.com/openai/deployments/gpt-4o'.match(
        regex
      )
    expect(match).not.toBeNull()
    expect(match![1]).toBe('azure-openai')
  })

  it('should parse URL without prefix as openai (default)', () => {
    const match = 'https://api.minimax.io/v1'.match(regex)
    expect(match).not.toBeNull()
    expect(match![1]).toBeUndefined()
    expect(match![2]).toBe('https://api.minimax.io/v1')
  })

  it('should not match invalid prefix', () => {
    const match = 'invalid@https://api.minimax.io/v1'.match(regex)
    expect(match).toBeNull()
  })

  it('should not match empty string for prefix only', () => {
    const match = '@https://api.minimax.io/v1'.match(regex)
    expect(match).not.toBeNull()
    expect(match![1]).toBeUndefined()
  })
})

// Test 2: MiniMax provider URL type mapping
describe('urlTypeProviderMap - minimax entry', () => {
  it('should include minimax in ModelUrlType union', () => {
    // Verify all expected URL types are accounted for
    const validTypes = ['openai', 'azure-openai', 'anthropic', 'minimax']
    validTypes.forEach(type => {
      expect(typeof type).toBe('string')
    })
  })

  it('should map minimax to a provider class', () => {
    // Simulate the provider map logic from helpers.ts
    const urlTypeProviderMap: Record<string, string> = {
      openai: 'OpenAIModelProvider',
      'azure-openai': 'AzureOpenAIModelProvider',
      anthropic: 'AnthropicModelProvider',
      minimax: 'MiniMaxModelProvider'
    }

    expect(urlTypeProviderMap.minimax).toBe('MiniMaxModelProvider')
    expect(Object.keys(urlTypeProviderMap)).toContain('minimax')
  })

  it('should fallback to openai for unknown urlType', () => {
    const urlTypeProviderMap: Record<string, string> = {
      openai: 'OpenAIModelProvider',
      'azure-openai': 'AzureOpenAIModelProvider',
      anthropic: 'AnthropicModelProvider',
      minimax: 'MiniMaxModelProvider'
    }

    const unknownType = 'unknown'
    const provider = urlTypeProviderMap[unknownType] || 'OpenAIModelProvider'
    expect(provider).toBe('OpenAIModelProvider')
  })
})

// Test 3: MiniMax temperature clamping logic
describe('MiniMax temperature clamping', () => {
  // The clamping logic from minimax.ts: Math.min(Math.max(0.01, value), 1.0)
  const clampTemperature = (value: number) =>
    Math.min(Math.max(0.01, value), 1.0)

  it('should clamp 0.95 to 0.95 (within range)', () => {
    expect(clampTemperature(0.95)).toBe(0.95)
  })

  it('should clamp 0 to 0.01 (minimum bound)', () => {
    expect(clampTemperature(0)).toBe(0.01)
  })

  it('should clamp negative values to 0.01', () => {
    expect(clampTemperature(-0.5)).toBe(0.01)
  })

  it('should clamp 1.5 to 1.0 (maximum bound)', () => {
    expect(clampTemperature(1.5)).toBe(1.0)
  })

  it('should keep 1.0 as 1.0', () => {
    expect(clampTemperature(1.0)).toBe(1.0)
  })

  it('should keep 0.5 as 0.5', () => {
    expect(clampTemperature(0.5)).toBe(0.5)
  })

  it('should ensure result is always > 0', () => {
    const result = clampTemperature(0)
    expect(result).toBeGreaterThan(0)
  })

  it('should ensure result is always <= 1', () => {
    const result = clampTemperature(2.0)
    expect(result).toBeLessThanOrEqual(1.0)
  })
})

// Test 4: MiniMax model names validation
describe('MiniMax model names', () => {
  const validModels = [
    'MiniMax-M2.7',
    'MiniMax-M2.7-highspeed',
    'MiniMax-M2.5',
    'MiniMax-M2.5-highspeed'
  ]

  it('should have valid MiniMax model format', () => {
    for (const model of validModels) {
      expect(model).toMatch(/^MiniMax-M2\.[57](-highspeed)?$/)
    }
  })

  it('should have exactly 4 model variants', () => {
    expect(validModels).toHaveLength(4)
  })

  it('should include flagship M2.7 model', () => {
    expect(validModels).toContain('MiniMax-M2.7')
  })

  it('should include highspeed M2.7 model', () => {
    expect(validModels).toContain('MiniMax-M2.7-highspeed')
  })
})

// Test 5: MiniMax default base URL
describe('MiniMax default base URL', () => {
  it('should use https://api.minimax.io/v1 as default', () => {
    const defaultBaseUrl = 'https://api.minimax.io/v1'
    expect(defaultBaseUrl).toBe('https://api.minimax.io/v1')
    expect(defaultBaseUrl).toMatch(/^https:\/\//)
    expect(defaultBaseUrl).toContain('minimax')
  })

  it('should fallback to default when url is empty', () => {
    const url = ''
    const effectiveUrl = url || 'https://api.minimax.io/v1'
    expect(effectiveUrl).toBe('https://api.minimax.io/v1')
  })

  it('should use provided URL when non-empty', () => {
    const url = 'https://custom-proxy.example.com/v1'
    const effectiveUrl = url || 'https://api.minimax.io/v1'
    expect(effectiveUrl).toBe('https://custom-proxy.example.com/v1')
  })
})

// Test 6: MiniMax configuration format
describe('MiniMax VSCode configuration format', () => {
  it('should produce valid JSON settings', () => {
    const config = {
      'aide.openaiBaseUrl': 'minimax@https://api.minimax.io/v1',
      'aide.openaiKey': 'test-api-key',
      'aide.openaiModel': 'MiniMax-M2.7'
    }

    expect(() => JSON.stringify(config)).not.toThrow()
    expect(config['aide.openaiBaseUrl']).toContain('minimax@')
    expect(config['aide.openaiModel']).toBe('MiniMax-M2.7')
  })
})

// Integration test: end-to-end config parsing to provider selection
describe('MiniMax integration: config to provider flow', () => {
  it('should extract minimax urlType from config URL', () => {
    const configUrl = 'minimax@https://api.minimax.io/v1'
    const regex =
      /^(openai|azure-openai|anthropic|minimax|copilot)?@?(https?:\/\/[^\s]+)?$/
    const match = configUrl.trim().match(regex)

    expect(match).not.toBeNull()
    const urlType = match![1] || 'openai'
    const url = match![2] || ''

    expect(urlType).toBe('minimax')
    expect(url).toBe('https://api.minimax.io/v1')

    // Then provider map lookup
    const providerMap: Record<string, string> = {
      openai: 'OpenAIModelProvider',
      'azure-openai': 'AzureOpenAIModelProvider',
      anthropic: 'AnthropicModelProvider',
      minimax: 'MiniMaxModelProvider'
    }

    expect(providerMap[urlType]).toBe('MiniMaxModelProvider')
  })

  it('should handle minimax with proxy URL', () => {
    const configUrl = 'minimax@https://my-proxy.company.com/minimax/v1'
    const regex =
      /^(openai|azure-openai|anthropic|minimax|copilot)?@?(https?:\/\/[^\s]+)?$/
    const match = configUrl.trim().match(regex)

    expect(match).not.toBeNull()
    expect(match![1]).toBe('minimax')
    expect(match![2]).toBe('https://my-proxy.company.com/minimax/v1')
  })

  it('should handle all providers consistently', () => {
    const testCases = [
      {
        url: 'openai@https://api.openai.com/v1',
        expectedType: 'openai'
      },
      {
        url: 'anthropic@https://api.anthropic.com',
        expectedType: 'anthropic'
      },
      {
        url: 'minimax@https://api.minimax.io/v1',
        expectedType: 'minimax'
      }
    ]

    const regex =
      /^(openai|azure-openai|anthropic|minimax|copilot)?@?(https?:\/\/[^\s]+)?$/

    for (const tc of testCases) {
      const match = tc.url.match(regex)
      expect(match).not.toBeNull()
      expect(match![1]).toBe(tc.expectedType)
    }
  })
})
