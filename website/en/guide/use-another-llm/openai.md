# OpenAI

[==OpenAI==](https://platform.openai.com) provides a variety of advanced AI models that can be applied to various natural language processing tasks.

This guide introduces how to configure and use the ==OpenAI== model in ==Aide==.

You can find more detailed information in the [==OpenAI== official documentation](https://platform.openai.com/docs/quickstart).

### API Base URL Configuration

You need to configure [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `https://api.openai.com/v1`

### API Key Configuration

You need to configure [`aide.openaiKey`](../configuration/openai-key.md) as your ==OpenAI== API Key. You can [create a key on the ==OpenAI== official website](https://platform.openai.com/account/api-keys)

::: tip

Obtaining an ==OpenAI== key requires binding a foreign credit card, and any model usage comes with a fee. If you are unable to obtain one, we recommend using other large language models or third-party proxies.

:::

### Model Configuration

You need to configure [`aide.openaiModel`](../configuration/openai-model.md) to the ==OpenAI== model. We recommend using the `gpt-4o` model. For more models, please refer to the [==OpenAI== Supported Models List](https://platform.openai.com/docs/models).

### Example Configuration File

Below is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "https://api.openai.com/v1",
  "aide.openaiKey": "your-openai-api-key",
  "aide.openaiModel": "gpt-4o"
}
```

Make sure to replace `"your-openai-api-key"` with your actual API Key.

### Related Links

- [Supported Models List](https://platform.openai.com/docs/models)
- [Official Documentation](https://platform.openai.com/docs/quickstart)
- [Create Key on Official Website](https://platform.openai.com/account/api-keys)
