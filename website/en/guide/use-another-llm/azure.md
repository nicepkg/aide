# Azure

## OpenAI

This guide introduces how to configure and use the ==Azure OpenAI== service in ==Aide==.

You can find more detailed information in the [==Azure OpenAI== Official Reference Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart?tabs=command-line%2Cpython-new&pivots=programming-language-javascript).

### API Base URL Configuration

You need to configure [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `azure-openai@https://{Endpoint}/openai/deployments/{Deployment}?api-version={ApiVersion}`

::: tip Note

Since the ==Azure OpenAI== interface is not compatible with the ==OpenAI== interface specification, you need to add `azure-openai@` as a prefix in the URL. This is a very important configuration, so please ensure it is set correctly.

- `Endpoint` is your ==Azure OpenAI== deployment domain.
- `Deployment` is your ==Azure OpenAI== deployment ID.
- `ApiVersion` is your ==Azure OpenAI== API version.

For example, if your ==Azure OpenAI== deployment domain is `westeurope.api.microsoft.com`, deployment ID is `gpt-4o-xxx`, and API version is `2024-07-15`, then your `API Base URL` would be:

`azure-openai@https://westeurope.api.microsoft.com/openai/deployments/gpt-4o-xxx?api-version=2024-07-15`.

:::

### API Key Configuration

You need to configure [`aide.openaiKey`](../configuration/openai-key.md) as your ==Azure OpenAI== API Key.

For detailed steps on how to obtain the API Key, please refer to the official reference documentation mentioned above.

### Model Configuration

When using ==Azure OpenAI==, there is no need to configure [`aide.openaiModel`](../configuration/openai-model.md).

### Example Configuration File

Below is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "azure-openai@https://westeurope.api.microsoft.com/openai/deployments/gpt-4o-xxx?api-version=2024-07-15",
  "aide.openaiKey": "your-azure-api-key"
}
```

Make sure to replace `"your-azure-api-key"` with your actual API Key.
