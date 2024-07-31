# IFlytek

## Spark

This guide introduces how to configure and use the ==IFlytek Spark== model in ==Aide==.

You can find more detailed information in the [official ==IFlytek Spark== reference documentation](https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html#_1-%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E).

### API Base URL Configuration

You need to set [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) to `https://spark-api-open.xf-yun.com/v1`.

### API Key Configuration

You need to set [`aide.openaiKey`](../configuration/openai-key.md) to your ==IFlytek Spark== API `key:secret`.

### Model Configuration

You need to set [`aide.openaiModel`](../configuration/openai-model.md) to the ==IFlytek Spark== model. We recommend using the `4.0Ultra` model. For more models, please refer to the official reference documentation linked above.

### Example Configuration File

Here is a complete configuration example:

```json
{
  "aide.openaiBaseUrl": "https://spark-api-open.xf-yun.com/v1",

  // Assuming your iFlytek key is k123, and secret is s123
  "aide.openaiKey": "k123:s123",
  "aide.openaiModel": "4.0Ultra"
}
```

Make sure to replace `"aide.openaiKey"` with your actual API `key:secret`.
