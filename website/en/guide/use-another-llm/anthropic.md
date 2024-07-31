# Anthropic

This guide introduces how to configure and use the ==Anthropic Claude== model in ==Aide==.

You can find more detailed information in the [==Anthropic Claude== Official Reference Documentation](https://docs.anthropic.com/en/docs/quickstart).

### API Base URL Configuration

You need to configure [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `anthropic@https://api.anthropic.com`

::: tip Note

Since the ==Anthropic== interface is not compatible with the ==OpenAI== interface specification, you need to add `anthropic@` as a prefix in the URL. This is a very important configuration, so please ensure it is set correctly.

:::

### API Key Configuration

You need to configure [`aide.openaiKey`](../configuration/openai-key.md) as your ==Anthropic Claude== API Key.

### Model Configuration

You need to configure [`aide.openaiModel`](../configuration/openai-model.md) to the ==Anthropic Claude== model. We recommend using the `claude-3-5-sonnet-20240620` model. For more models, please refer to the [Model List Documentation](https://docs.anthropic.com/en/docs/about-claude/models).

### Example Configuration File

Below is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "anthropic@https://api.anthropic.com",
  "aide.openaiKey": "your-anthropic-api-key",
  "aide.openaiModel": "claude-3-5-sonnet-20240620"
}
```

Make sure to replace `"your-anthropic-api-key"` with your actual API Key.
