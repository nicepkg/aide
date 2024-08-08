# LocalAI

[==LocalAI==](https://localai.io) 是一个本地运行开源模型的开源 `Docker` 镜像，支持大部份开源模型。相对于 [==Ollama==](./ollama.md)，它更适合部署到局域网服务器供小团体使用。

本指南介绍如何在 ==Aide== 中配置和使用 ==LocalAI== 模型。

您可以在 [==LocalAI== 官网文档](https://localai.io) 获取更多详细信息。

### 安装 LocalAI

在使用 ==LocalAI== 之前，请确保已参考 [==LocalAI== 官网文档](https://localai.io) 安装并运行 `Docker` 镜像。

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `http://localhost:8080/v1`（假设您的服务运行在 8080 端口）

### 密钥配置

您可以随意填写以配置 [`aide.openaiKey`](../configuration/openai-key.md)。例如，填入 `sk-LocalAI`。

### 模型配置

您需要配置 [`aide.openaiModel`](../configuration/openai-model.md) 为 ==LocalAI== 模型，我们推荐使用 `llama3-instruct` 模型。更多模型请参考 [支持的模型列表](https://localai.io/models/#list-models)。

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "http://localhost:8080/v1",
  "aide.openaiKey": "sk-LocalAI",
  "aide.openaiModel": "llama3-instruct"
}
```

### 相关链接

- [LocalAI GitHub 仓库](https://github.com/mudler/LocalAI)
- [下载安装地址](https://github.com/mudler/LocalAI#-install-docker)
- [官网文档](https://localai.io)
- [支持的模型列表](https://localai.io/models/#list-models)
