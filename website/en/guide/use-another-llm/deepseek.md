# Deepseek

This guide introduces how to configure and use the ==Deepseek== model in ==Aide==.

You can find more detailed information in the [==Deepseek== Official Reference Documentation](https://platform.deepseek.com/api-docs/).

### API Base URL Configuration

You need to configure [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `https://api.deepseek.com/v1`

### API Key Configuration

You need to configure [`aide.openaiKey`](../configuration/openai-key.md) as your ==Deepseek== API Key.

### Model Configuration

You need to configure [`aide.openaiModel`](../configuration/openai-model.md) to the ==Deepseek== model. We recommend using the `deepseek-coder` model. For more models, please refer to the official reference documentation above.

### Example Configuration File

Below is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "https://api.deepseek.com/v1",
  "aide.openaiKey": "your-deepseek-api-key",
  "aide.openaiModel": "deepseek-coder"
}
```

Make sure to replace `"your-deepseek-api-key"` with your actual API Key.
