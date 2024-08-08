# Ollama

[==Ollama==](https://ollama.com) 是一个本地离线运行开源模型的开源客户端，它支持所有电脑平台，支持大部份开源模型。

本指南介绍如何在 ==Aide== 中配置和使用 ==Ollama== 模型。

您可以在 [==Ollama== 官网文档](https://ollama.com/blog/openai-compatibility) 获取更多详细信息。

### 安装 Ollama

在使用 ==Ollama== 之前，请确保已从 [==Ollama== 官方网站](https://ollama.com) 下载并安装客户端。您可以从[此链接](https://ollama.com/download)进行下载。更多信息请参考[==Ollama== 开源地址](https://github.com/ollama/ollama)。

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `http://localhost:11434/v1`

### 密钥配置

你可以随便填以配置 [`aide.openaiKey`](../configuration/openai-key.md)。比如填个 `sk-ollama`。

### 模型配置

你需要配置 [`aide.openaiModel`](../configuration/openai-model.md) 为 ==Ollama== 模型，我们推荐使用 `llama3.1` 模型。更多模型请参考 [支持的模型列表](https://ollama.com/library)。

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "http://localhost:11434/v1",
  "aide.openaiKey": "sk-ollama",
  "aide.openaiModel": "llama3.1"
}
```

### 相关链接

- [Ollama 官网](https://ollama.com)
- [下载安装地址](https://ollama.com/download)
- [开源地址](https://github.com/ollama/ollama)
- [支持的模型列表](https://ollama.com/library)
- [官网文档](https://ollama.com/blog/openai-compatibility)
