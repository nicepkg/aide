# Anthropic

本指南介绍如何在 ==Aide== 中配置和使用 ==Anthropic Claude== 模型。

您可以在 [==Anthropic Claude== 官方参考文档](https://docs.anthropic.com/en/docs/quickstart) 获取更多详细信息。

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `anthropic@https://api.anthropic.com`

::: tip 提示

==Anthropic== 接口因为不兼容 ==OpenAI== 的接口规范，所以需要在 URL 前加上 `anthropic@` 作为标记。这是非常重要的配置，请务必确保正确设置。

:::

### 密钥配置

您需要配置 [`aide.openaiKey`](../configuration/openai-key.md) 为您的 ==Anthropic Claude== API Key。

### 模型配置

你需要配置 [`aide.openaiModel`](../configuration/openai-model.md) 为 ==Anthropic Claude== 模型，我们推荐使用 `claude-3-5-sonnet-20240620` 模型。更多模型请参考 [模型列表文档](https://docs.anthropic.com/en/docs/about-claude/models)。

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "anthropic@https://api.anthropic.com",
  "aide.openaiKey": "your-anthropic-api-key",
  "aide.openaiModel": "claude-3-5-sonnet-20240620"
}
```

确保将 `"your-anthropic-api-key"` 替换为您实际的 API Key。
