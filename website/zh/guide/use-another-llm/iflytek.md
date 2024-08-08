# 讯飞

## 星火

本指南介绍如何在 ==Aide== 中配置和使用==讯飞星火==模型。

您可以在 [==讯飞星火==官方参考文档](https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html#_1-%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E) 获取更多详细信息。

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `https://spark-api-open.xf-yun.com/v1`

### 密钥配置

您需要配置 [`aide.openaiKey`](../configuration/openai-key.md) 为您的==讯飞星火== API `key:secret`。

### 模型配置

你需要配置 [`aide.openaiModel`](../configuration/openai-model.md) 为==讯飞星火==模型，我们推荐使用 `4.0Ultra` 模型。更多模型请参考上面的官方参考文档。

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "https://spark-api-open.xf-yun.com/v1",

  // 假设你的讯飞 key 是 k123, secret 是 s123
  "aide.openaiKey": "k123:s123",
  "aide.openaiModel": "4.0Ultra"
}
```

确保将 `"aide.openaiKey"` 替换为您实际的 API `key:secret`。
