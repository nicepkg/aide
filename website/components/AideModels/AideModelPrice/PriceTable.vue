<template>
  <table>
    <thead>
      <tr>
        <th>模型名称</th>
        <th v-if="!isFixedPrice">提问价格 (每 100 万 token 所花费)</th>
        <th v-if="!isFixedPrice">回答价格（每 100 万 token 所花费）</th>
        <th v-if="isFixedPrice">每次调用 API 价格</th>
        <th v-if="modelRecommend">推荐原因</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="modelName in models" :key="modelName">
        <td><code>{{ modelName }}</code></td>
        <td v-if="!isFixedPrice">{{ formatCurrency((modelPriceData[modelName] as TokenPrice).inputMillionPrice) }}</td>
        <td v-if="!isFixedPrice">{{ formatCurrency((modelPriceData[modelName] as TokenPrice).outputMillionPrice) }}</td>
        <td v-if="isFixedPrice">{{ formatCurrency((modelPriceData[modelName] as FixedPrice).fixedPrice) }}</td>
        <td v-if="modelRecommend">{{ modelRecommend[modelName] }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ModelPrice, TokenPrice, FixedPrice } from './types';

defineProps<{
  models: string[];
  modelPriceData: ModelPrice;
  currency: string;
  formatCurrency: (amount: number | undefined, currencyType?: string) => string;
  modelRecommend?: Record<string, string>;
  isFixedPrice?: boolean;
}>();
</script>
