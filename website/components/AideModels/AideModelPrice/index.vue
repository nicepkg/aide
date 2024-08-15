<template>
  <div>
    <template v-if="!onlyShowAllModels && !onlyShowMonthlyModels">
      <b>
        推荐使用模型（单位：{{ currency }}）
        <button class="aide-button" @click="toggleCurrency">
          切换单位到 -> {{ currency === '虚拟美元' ? '现实人民币' : '虚拟美元' }}
        </button>
      </b>

      <PriceTable :models="recommendedModels" :model-price-data="modelPriceData" :currency="currency"
        :format-currency="formatCurrency" :model-recommend="modelRecommend" />
    </template>

    <template v-if="!onlyShowMonthlyModels">
      <details class="details custom-block">
        <summary>浏览按需付费支持的模型</summary>

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
    </template>

    <template v-if="onlyShowMonthlyModels">
      <details class="details custom-block" v-if="onlyShowMonthlyModels">
        <summary>浏览月卡支持的模型</summary>

        <table>
          <thead>
            <tr>
              <th>模型名称</th>
              <th>包月调用（超过一定次数会降速）</th>
              <th>是否推荐</th>
              <th>推荐原因</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="modelName in monthlyModels" :key="modelName">
              <td><code>{{ modelName }}</code></td>
              <td>无限次</td>
              <td>{{ modelRecommend[modelName] ? '是' : '' }}</td>
              <td>{{ modelRecommend[modelName] || '' }}</td>
            </tr>
          </tbody>
        </table>
      </details>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import modelData from './model-price.json'
import PriceTable from './PriceTable.vue'
import { ModelPrice } from './types'

defineProps({
  onlyShowAllModels: {
    'type': Boolean,
    'default': false,
  },
  onlyShowMonthlyModels: {
    'type': Boolean,
    'default': false,
  },
})

const groupRatio = modelData.data.GroupRatio.default
const currency = ref('虚拟美元')
const exchangeRate = 3 // 3 人民币 = 1 虚拟美元

const modelRecommend: Record<string, string> = {
  'gpt-4o': '智商高，便宜好用，支持读图和 function_call',
  'gpt-4o-2024-08-06': '智商中上，很便宜，支持读图和 function_call',
  'gpt-4o-mini': '智商中等，非常非常便宜，支持读图和 function_call',
  'claude-3-5-sonnet-20240620': '智商高，支持读图，支持 function_call',
}

const monthlyModels = [
  "claude-3-5-sonnet-20240620",
  "claude-3-haiku-20240307",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro-latest",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-1106",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4o-2024-08-06",
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18"
]

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
