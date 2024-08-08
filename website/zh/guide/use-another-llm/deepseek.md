# Deepseek

本指南介绍如何在 ==Aide== 中配置和使用 ==Deepseek== 模型。

您可以在 [==Deepseek== 官方参考文档](https://platform.deepseek.com/api-docs/) 获取更多详细信息。

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `https://api.deepseek.com/v1`

### 密钥配置

您需要配置 [`aide.openaiKey`](../configuration/openai-key.md) 为您的 ==Deepseek== API Key。

### 模型配置

你需要配置 [`aide.openaiModel`](../configuration/openai-model.md) 为 ==Deepseek== 模型，我们推荐使用 `deepseek-coder` 模型。更多模型请参考上面的官方参考文档。

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "https://api.deepseek.com/v1",
  "aide.openaiKey": "your-deepseek-api-key",
  "aide.openaiModel": "deepseek-coder"
}
```

确保将 `"your-deepseek-api-key"` 替换为您实际的 API Key。
