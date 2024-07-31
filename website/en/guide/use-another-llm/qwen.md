# Qwen

This guide introduces how to configure and use the ==Qwen== model in ==Aide==.

You can find more detailed information in the [==Qwen== Official Reference Documentation](https://help.aliyun.com/zh/dashscope/developer-reference/compatibility-of-openai-with-dashscope).

### API Base URL Configuration

You need to configure [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `https://dashscope.aliyuncs.com/compatible-mode/v1`.

### API Key Configuration

You need to configure [`aide.openaiKey`](../configuration/openai-key.md) as your ==Qwen== API Key.

### Model Configuration

You need to configure [`aide.openaiModel`](../configuration/openai-model.md) to the ==Qwen== model. We recommend using the `qwen-long` model. For more models, please refer to the official reference documentation mentioned above.

### Example Configuration File

Below is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "aide.openaiKey": "your-qwen-api-key",
  "aide.openaiModel": "qwen-long"
}
```

Make sure to replace `"your-qwen-api-key"` with your actual API Key.
