<template>
  <div>
    <h3>
      推荐使用模型（单位：{{ currency }}）
      <button class="aide-button" @click="toggleCurrency">
        切换单位到 -> {{ currency === '虚拟美元' ? '现实人民币' : '虚拟美元' }}
      </button>
    </h3>

    <PriceTable :models="recommendedModels" :model-price-data="modelPriceData" :currency="currency"
      :format-currency="formatCurrency" :model-recommend="modelRecommend" />

    <h3>浏览所有支持的模型</h3>
    <details class="details custom-block">
      <summary>所有支持的模型价格列表</summary>

      <h3>
        按量付费模型（单位：{{ currency }}）
        <button class="aide-button" @click="toggleCurrency">
          切换单位到 -> {{ currency === '虚拟美元' ? '现实人民币' : '虚拟美元' }}
        </button>
      </h3>

      <PriceTable :models="tokenPriceModels" :model-price-data="modelPriceData" :currency="currency"
        :format-currency="formatCurrency" />

      <h3>
        按次付费模型（单位：{{ currency }}）
        <button class="aide-button" @click="toggleCurrency">
          切换单位到 -> {{ currency === '虚拟美元' ? '现实人民币' : '虚拟美元' }}
        </button>
      </h3>

      <PriceTable :models="fixedPriceModels" :model-price-data="modelPriceData" :currency="currency"
        :format-currency="formatCurrency" :is-fixed-price="true" />
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import modelData from './model-price.json'
import PriceTable from './PriceTable.vue'
import { ModelPrice } from './types'

const groupRatio = modelData.data.GroupRatio.default
const currency = ref('虚拟美元')
const exchangeRate = 3 // 3 人民币 = 1 虚拟美元

const modelRecommend: Record<string, string> = {
  'gpt-4o': '智商高，便宜好用，支持读图和 function_call',
  'gpt-4o-2024-08-06': '智商中上，很便宜，支持读图和 function_call',
  'gpt-4o-mini': '智商中等，非常非常便宜，支持读图和 function_call',
  'claude-3-5-sonnet-20240620': '智商高，支持读图，转发 API 目前不支持 function_call',
}

const modelPriceData = ref<ModelPrice>(convertModelPrice(modelData))

const recommendedModels = computed(() => Object.keys(modelRecommend))
const tokenPriceModels = computed(() =>
  Object.entries(modelPriceData.value)
    .filter(([_, m]) => m.type === 'tokenPrice')
    .map(([name]) => name)
    .sort((a, b) => {
      return a.localeCompare(b)
    })
)
const fixedPriceModels = computed(() =>
  Object.entries(modelPriceData.value)
    .filter(([_, m]) => m.type === 'fixedPrice')
    .map(([name]) => name)
    .sort((a, b) => {
      return a.localeCompare(b)
    })
)

function convertModelPrice(jsonData: typeof modelData): ModelPrice {
  const modelPrice: ModelPrice = {}

  // Handle Models with token price
  jsonData.data.Models.forEach((modelName: string) => {
    const ratio = jsonData.data.ModelRatio[modelName]
    const completionRatio = jsonData.data.CompletionRatio[modelName]

    if (ratio !== undefined) {
      modelPrice[modelName] = {
        type: 'tokenPrice',
        ratio,
        completionRatio: completionRatio || ratio,
        inputMillionPrice: (groupRatio * ratio * 1000000) / 500000,
        outputMillionPrice: (groupRatio * ratio * 1000000 * (completionRatio || 1)) / 500000,
      }
    }
  })

  // Handle Models with fixed price
  const fixedPriceModels = [
    ...Object.keys(jsonData.data.ModelFixedPrice),
    ...Object.keys(jsonData.data.DynamicRouterModelMap),
  ]

  fixedPriceModels.forEach((modelName: string) => {
    const fixedPrice = jsonData.data.ModelFixedPrice[modelName] || jsonData.data.DynamicRouterModelMap[modelName]
    if (fixedPrice !== undefined) {
      modelPrice[modelName] = {
        type: 'fixedPrice',
        fixedPrice,
      }
    } else {
      delete modelPrice[modelName]
    }
  })

  return modelPrice
}

function formatNumber(num: number, fixed: number): string {
  const numString = num.toFixed(fixed)
  return numString.replace(/\.?0+$/, '')
}

function formatCurrency(amount: number | undefined, currencyType = currency.value): string {
  if (amount === undefined) return '-'
  const convertedAmount = currencyType === '虚拟美元' ? amount : amount * exchangeRate
  return `${currencyType === '虚拟美元' ? '$' : '¥'}${formatNumber(convertedAmount, 4)}`
}

function toggleCurrency() {
  currency.value = currency.value === '虚拟美元' ? '现实人民币' : '虚拟美元'
}
</script>
