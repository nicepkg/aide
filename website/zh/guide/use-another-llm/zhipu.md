# 智谱

本指南介绍如何在 ==Aide== 中配置和使用==智谱==模型。

您可以在 [==智谱==官方参考文档](https://bigmodel.cn/dev/api#openai_sdk) 获取更多详细信息。

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `https://open.bigmodel.cn/api/paas/v4`

### 密钥配置

您需要配置 [`aide.openaiKey`](../configuration/openai-key.md) 为您的==智谱== API Key。

### 模型配置

你需要配置 [`aide.openaiModel`](../configuration/openai-model.md) 为==智谱==模型，我们推荐使用 `glm-4` 模型。更多模型请参考上面的官方参考文档。

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "https://open.bigmodel.cn/api/paas/v4",
  "aide.openaiKey": "your-zhipu-api-key",
  "aide.openaiModel": "glm-4"
}
```

确保将 `"your-zhipu-api-key"` 替换为您实际的 API Key。
