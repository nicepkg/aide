# OpenAI

[==OpenAI==](https://platform.openai.com) 提供了多种先进的 AI 模型，可以应用于各种自然语言处理任务。

本指南介绍如何在 ==Aide== 中配置和使用 ==OpenAI== 模型。

您可以在[==OpenAI== 官网文档](https://platform.openai.com/docs/quickstart)获取更多详细信息。

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `https://api.openai.com/v1`

### 密钥配置

您需要配置 [`aide.openaiKey`](../configuration/openai-key.md) 为您的 ==OpenAI== API Key。你可以在 [==OpenAI== 官网创建 Key](https://platform.openai.com/account/api-keys)

::: tip

获取 ==OpenAI== Key 需要绑定国外的信用卡，并且任何模型都是收费的。如果您无法获取，建议您使用其他大语言模型，或者第三方转发商。

:::

### 模型配置

你需要配置 [`aide.openaiModel`](../configuration/openai-model.md) 为 ==OpenAI== 模型。我们推荐使用 `gpt-4o` 模型。更多模型请参考 [==OpenAI== 支持的模型列表](https://platform.openai.com/docs/models)。

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "https://api.openai.com/v1",
  "aide.openaiKey": "your-openai-api-key",
  "aide.openaiModel": "gpt-4o"
}
```

确保将 `"your-openai-api-key"` 替换为您实际的 API Key。

### 相关链接

- [支持的模型列表](https://platform.openai.com/docs/models)
- [官网文档](https://platform.openai.com/docs/quickstart)
- [官网 Key 创建地址](https://platform.openai.com/account/api-keys)
