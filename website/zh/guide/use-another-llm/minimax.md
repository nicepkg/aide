# MiniMax

本指南介绍如何在 ==Aide== 中配置和使用 ==MiniMax== 模型。

您可以在 [==MiniMax== 官方参考文档](https://platform.minimaxi.com/document/introduction) 中找到更多详细信息。

### API Base URL 配置

您需要将 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 配置为 `minimax@https://api.minimax.io/v1`

::: tip 注意

由于 ==MiniMax== 有特定的参数要求（如温度约束），您需要在 URL 中添加 `minimax@` 前缀。这可以确保扩展正确处理 MiniMax 特定的配置。

:::

### API Key 配置

您需要将 [`aide.openaiKey`](../configuration/openai-key.md) 配置为您的 ==MiniMax== API Key。

您可以从 [MiniMax 平台](https://platform.minimaxi.com/) 获取您的 API Key。

### 模型配置

您需要将 [`aide.openaiModel`](../configuration/openai-model.md) 配置为 ==MiniMax== 模型。我们推荐使用 `MiniMax-M2.7` 模型。其他可用模型包括：

- `MiniMax-M2.7` - 最新旗舰模型，支持 100 万上下文窗口
- `MiniMax-M2.7-highspeed` - M2.7 的高速版本
- `MiniMax-M2.5` - 上一代模型，支持 204K 上下文
- `MiniMax-M2.5-highspeed` - M2.5 的高速版本

更多模型请参考上方的官方参考文档。

### 配置文件示例

下面是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "minimax@https://api.minimax.io/v1",
  "aide.openaiKey": "your-minimax-api-key",
  "aide.openaiModel": "MiniMax-M2.7"
}
```

请确保将 `"your-minimax-api-key"` 替换为您的实际 API Key。
