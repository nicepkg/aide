# LocalAI

[==LocalAI==](https://localai.io) is an open-source `Docker` image that allows running open-source models locally, supporting most open-source models. Compared to [==Ollama==](./ollama.md), it is more suitable for deployment on LAN servers for small groups.

This guide introduces how to configure and use the ==LocalAI== model in ==Aide==.

You can find more detailed information in the [==LocalAI== Official Documentation](https://localai.io).

### Installing LocalAI

Before using ==LocalAI==, please ensure you have referred to the [==LocalAI== Official Documentation](https://localai.io) to install and run the `Docker` image.

### API Base URL Configuration

You need to configure [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `http://localhost:8080/v1` (assuming your service is running on port 8080).

### API Key Configuration

You can configure [`aide.openaiKey`](../configuration/openai-key.md) with any value. For example, you can enter `sk-LocalAI`.

### Model Configuration

You need to configure [`aide.openaiModel`](../configuration/openai-model.md) to the ==LocalAI== model. We recommend using the `llama3-instruct` model. For more models, please refer to the [Supported Models List](https://localai.io/models/#list-models).

### Example Configuration File

Below is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "http://localhost:8080/v1",
  "aide.openaiKey": "sk-LocalAI",
  "aide.openaiModel": "llama3-instruct"
}
```

### Related Links

- [LocalAI GitHub Repository](https://github.com/mudler/LocalAI)
- [Installation Guide](https://github.com/mudler/LocalAI#-install-docker)
- [Official Documentation](https://localai.io)
- [Supported Models List](https://localai.io/models/#list-models)
