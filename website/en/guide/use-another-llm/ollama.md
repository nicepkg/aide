# Ollama

[==Ollama==](https://ollama.com) is an open-source client for running open-source models offline locally. It supports all computer platforms and most open-source models.

This guide introduces how to configure and use the ==Ollama== model in ==Aide==.

You can find more detailed information in the [==Ollama== Official Documentation](https://ollama.com/blog/openai-compatibility).

### Install Ollama

Before using ==Ollama==, please ensure you have downloaded and installed the client from the [==Ollama== Official Website](https://ollama.com). You can download it from [this link](https://ollama.com/download). For more information, please refer to the [==Ollama== Open-Source Repository](https://github.com/ollama/ollama).

### API Base URL Configuration

You need to configure [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `http://localhost:11434/v1`

### API Key Configuration

You can configure [`aide.openaiKey`](../configuration/openai-key.md) with any value. For example, you can use `sk-ollama`.

### Model Configuration

You need to configure [`aide.openaiModel`](../configuration/openai-model.md) to the ==Ollama== model. We recommend using the `llama3.1` model. For more models, please refer to the [Supported Models List](https://ollama.com/library).

### Example Configuration File

Below is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "http://localhost:11434/v1",
  "aide.openaiKey": "sk-ollama",
  "aide.openaiModel": "llama3.1"
}
```

### Related Links

- [Ollama Official Website](https://ollama.com)
- [Download Link](https://ollama.com/download)
- [Open-Source Repository](https://github.com/ollama/ollama)
- [Supported Models List](https://ollama.com/library)
- [Official Documentation](https://ollama.com/blog/openai-compatibility)
