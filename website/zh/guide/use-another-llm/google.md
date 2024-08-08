# Google

## Gemini

本指南介绍如何在 ==Aide== 中配置和使用 ==Google Gemini== 模型。

您可以在 [==Google Gemini== 官方参考文档](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/call-gemini-using-openai-library) 获取更多详细信息。

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `https://{LOCATION}-aiplatform.googleapis.com/v1beta1/projects/{PROJECT}/locations/{LOCATION}/endpoints/openapi`

::: tip 提示

- `Location` 是你的 ==Google Cloud== 项目的地理位置，例如 `us-central1`。
- `Project` 是你的 ==Google Cloud== 项目名称。

举例子，如果你的 ==Google Cloud== 项目名称是 `my-project`，地理位置是 `us-central1`，那么你的 API Base URL 就是：

`https://us-central1-aiplatform.googleapis.com/v1beta1/projects/my-project/locations/us-central1/endpoints/openapi`。

:::

### 密钥配置

您需要配置 [`aide.openaiKey`](../configuration/openai-key.md) 为您的 ==Google Gemini== API Key。

获取 API Key 的详细步骤请参考上面的官方参考文档。

### 模型配置

你需要配置 [`aide.openaiModel`](../configuration/openai-model.md) 为 ==Google Gemini== 模型，我们推荐使用 `google/gemini-1.5-flash-001` 模型。更多模型请参考上面的官方参考文档。

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "https://{LOCATION}-aiplatform.googleapis.com/v1beta1/projects/{PROJECT}/locations/{LOCATION}/endpoints/openapi",
  "aide.openaiKey": "your-google-gemini-api-key",
  "aide.openaiModel": "google/gemini-1.5-flash-001"
}
```

确保将 `"your-google-gemini-api-key"` 替换为您实际的 API Key，并在 `{LOCATION}` 和 `{PROJECT}` 中填入您的具体位置信息和项目名称。
