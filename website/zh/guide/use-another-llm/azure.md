# Azure

## OpenAI

本指南介绍如何在 ==Aide== 中配置和使用 ==Azure OpenAI== 服务。

您可以在 [==Azure OpenAI== 官方参考文档](https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart?tabs=command-line%2Cpython-new&pivots=programming-language-javascript) 获取更多详细信息。

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `azure-openai@https://{Endpoint}/openai/deployments/{Deployment}?api-version={ApiVersion}`

::: tip 提示

==Azure OpenAI== 接口因为不兼容 ==OpenAI== 的接口规范，所以需要在 URL 前加上 `azure-openai@` 作为标记。这是非常重要的配置，请务必确保正确设置。

- `Endpoint` 是你的 ==Azure OpenAI== 的部署域名。
- `Deployment` 是你的 ==Azure OpenAI== 的部署 ID。
- `ApiVersion` 是你的 ==Azure OpenAI== 的 API 版本。

举例子，如果你的 ==Azure OpenAI== 的部署域名是 `westeurope.api.microsoft.com`，部署 ID 是 `gpt-4o-xxx`，API 版本是 `2024-07-15`，那么你的 `API Base URL` 就是：

`azure-openai@https://westeurope.api.microsoft.com/openai/deployments/gpt-4o-xxx?api-version=2024-07-15`。

:::

### 密钥配置

您需要配置 [`aide.openaiKey`](../configuration/openai-key.md) 为您的 ==Azure OpenAI== API Key。

获取 API Key 的详细步骤请参考上面的官方参考文档。

### 模型配置

使用 ==Azure OpenAI== 时，无需配置 [`aide.openaiModel`](../configuration/openai-model.md)。

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "azure-openai@https://westeurope.api.microsoft.com/openai/deployments/gpt-4o-xxx?api-version=2024-07-15",
  "aide.openaiKey": "your-azure-api-key"
}
```

确保将 `"your-azure-api-key"` 替换为您实际的 API Key。
