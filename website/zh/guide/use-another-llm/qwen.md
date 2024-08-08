# 通义千问

本指南介绍如何在 ==Aide== 中配置和使用==通义千问==模型。

您可以在 [==通义千问==官方参考文档](https://help.aliyun.com/zh/dashscope/developer-reference/compatibility-of-openai-with-dashscope) 获取更多详细信息

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `https://dashscope.aliyuncs.com/compatible-mode/v1`

### 密钥配置

您需要配置 [`aide.openaiKey`](../configuration/openai-key.md) 为您的==通义千问== API Key。

### 模型配置

你需要配置 [`aide.openaiModel`](../configuration/openai-model.md) 为==通义千问==模型，我们推荐使用 `qwen-long` 模型。更多模型请参考上面的官方参考文档。

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "aide.openaiKey": "your-qwen-api-key",
  "aide.openaiModel": "qwen-long"
}
```

确保将 `"your-qwen-api-key"` 替换为您实际的 API Key。
