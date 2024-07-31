# Zhipu

This guide introduces how to configure and use the ==Zhipu== model in ==Aide==.

You can find more detailed information in the [==Zhipu== Official Reference Documentation](https://bigmodel.cn/dev/api#openai_sdk).

### API Base URL Configuration

You need to configure [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `https://open.bigmodel.cn/api/paas/v4`

### API Key Configuration

You need to configure [`aide.openaiKey`](../configuration/openai-key.md) as your ==Zhipu== API Key.

### Model Configuration

You need to configure [`aide.openaiModel`](../configuration/openai-model.md) to the ==Zhipu== model. We recommend using the `glm-4` model. For more models, please refer to the official reference documentation mentioned above.

### Example Configuration File

Below is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "https://open.bigmodel.cn/api/paas/v4",
  "aide.openaiKey": "your-zhipu-api-key",
  "aide.openaiModel": "glm-4"
}
```

Make sure to replace `"your-zhipu-api-key"` with your actual API Key.
