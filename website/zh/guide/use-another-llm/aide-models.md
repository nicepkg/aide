# Aide 模型聚合(便宜)

**选择的原因**：

- 你希望 `更便宜` 地调用 ==openAI== 以及各大供应商的模型。
- 你希望 `更便捷` 地获取 `key`，而不用搞各种国外手机号或者国外信用卡，国内即付即用。
- 你希望 `稳定`，不用担心被 ==openAI== 封号。
- 你希望 `不用挂梯子或者代理`，不用担心网络问题。

**不选择的原因**：

- 商业高并发需求，我们的服务可能无法满足。

::: tip 提示

==Aide== 模型聚合服务不仅仅支持在 ==Aide== 用，你可以用到大部份 AI 开源项目上。

只要它们支持配置 ==OpenAI== 接口基础请求路径。

这只是 ==Aide== 提供的一个额外的选择，你依旧可以使用你自己喜欢的模型或者接口。

:::

## 价格

你购买的密钥就是 ==key（密钥）==， 你可以用==密钥==调用以下所有模型， ==密钥==的余额将在你调用模型时扣除。

::: tip 提示

==实际价格是官方价格的 **4.2** 折==

- `虚拟美元` 比较贴近官方价格
- 但是你用 `3 元人民币` 就能购买 `1 虚拟美元`
- 而国际汇率是 `7 元人民币` 换 `1 美元`
- 也就是你每用 `1 虚拟美元` 能相对于官方价格节省 `4 元人民币`

:::

<AideModelPrice />

## 购买

你可以打开[这个链接](https://key.opendevelop.tech/liebiao/322FECDC5792B7AD)购买。

需要售后可以加 QQ：`2530185073`

## 查询余额

你可以点击 ==VSCode== 底部 `Aide 消耗` 按钮随时查询调用、余额等信息。

<img src="/aide-key-usage-info.zh.jpg" style="width: 100%; max-width: 1080px; border-radius: 0.5rem;" alt="Aide 消耗信息查询截图" />

## 配置

### 接口基础路径配置

您需要配置 [`aide.openaiBaseUrl`](../configuration/openai-base-url.md) 为 `https://api.zyai.online/v1`

### 密钥配置

您需要配置 [`aide.openaiKey`](../configuration/openai-key.md) 为您购买的 ==密钥==

### 模型配置

你可以配置 `openAI` 的模型，我们推荐使用 `gpt-4o` 模型。更多模型请参考 [支持的模型列表](https://api.zyai.online/v1/models)

### 示例配置文件

以下是一个完整的配置示例：

```json
{
  "aide.openaiBaseUrl": "https://api.zyai.online/v1",
  "aide.openaiKey": "你购买的密钥",
  "aide.openaiModel": "gpt-4o"
}
```
