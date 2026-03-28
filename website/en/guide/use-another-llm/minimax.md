# MiniMax

This guide introduces how to configure and use the ==MiniMax== model in ==Aide==.

You can find more detailed information in the [==MiniMax== Official Reference Documentation](https://platform.minimaxi.com/document/introduction).

### API Base URL Configuration

You need to configure [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `minimax@https://api.minimax.io/v1`

::: tip Note

Since ==MiniMax== has specific parameter requirements (such as temperature constraints), you need to add `minimax@` as a prefix in the URL. This ensures the extension handles MiniMax-specific configurations correctly.

:::

### API Key Configuration

You need to configure [`aide.openaiKey`](../configuration/openai-key.md) as your ==MiniMax== API Key.

You can obtain your API key from the [MiniMax Platform](https://platform.minimaxi.com/).

### Model Configuration

You need to configure [`aide.openaiModel`](../configuration/openai-model.md) to the ==MiniMax== model. We recommend using the `MiniMax-M2.7` model. Other available models include:

- `MiniMax-M2.7` - Latest flagship model with 1M context window
- `MiniMax-M2.7-highspeed` - Faster variant of M2.7
- `MiniMax-M2.5` - Previous generation model with 204K context
- `MiniMax-M2.5-highspeed` - Faster variant of M2.5

For more models, please refer to the official reference documentation above.

### Example Configuration File

Below is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "minimax@https://api.minimax.io/v1",
  "aide.openaiKey": "your-minimax-api-key",
  "aide.openaiModel": "MiniMax-M2.7"
}
```

Make sure to replace `"your-minimax-api-key"` with your actual API Key.
