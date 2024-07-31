# Google

## Gemini

This guide introduces how to configure and use the ==Google Gemini== model in ==Aide==.

You can find more detailed information in the [==Google Gemini== Official Reference Documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/call-gemini-using-openai-library).

### API Base URL Configuration

You need to configure [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `https://{LOCATION}-aiplatform.googleapis.com/v1beta1/projects/{PROJECT}/locations/{LOCATION}/endpoints/openapi`

::: tip Note

- `Location` is the geographic location of your ==Google Cloud== project, such as `us-central1`.
- `Project` is the name of your ==Google Cloud== project.

For example, if your ==Google Cloud== project name is `my-project` and the geographic location is `us-central1`, then your API Base URL would be:

`https://us-central1-aiplatform.googleapis.com/v1beta1/projects/my-project/locations/us-central1/endpoints/openapi`.

:::

### API Key Configuration

You need to configure [`aide.openaiKey`](../configuration/openai-key.md) as your ==Google Gemini== API Key.

For detailed steps to obtain the API Key, please refer to the official reference documentation mentioned above.

### Model Configuration

You need to configure [`aide.openaiModel`](../configuration/openai-model.md) to the ==Google Gemini== model. We recommend using the `google/gemini-1.5-flash-001` model. For more models, please refer to the official reference documentation mentioned above.

### Example Configuration File

Below is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "https://{LOCATION}-aiplatform.googleapis.com/v1beta1/projects/{PROJECT}/locations/{LOCATION}/endpoints/openapi",
  "aide.openaiKey": "your-google-gemini-api-key",
  "aide.openaiModel": "google/gemini-1.5-flash-001"
}
```

Make sure to replace `"your-google-gemini-api-key"` with your actual API Key, and fill in your specific location information and project name in `{LOCATION}` and `{PROJECT}`.
