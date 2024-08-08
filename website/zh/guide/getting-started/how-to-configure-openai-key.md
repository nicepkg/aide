# 如何配置 ==OpenAI Key==

## 我有 ==OpenAI Key==

1. 参考这个文档打开 ==Aide== 设置区域：[自定义配置](./customize-configuration.md)
2. 粘贴你的 ==OpenAI Key== 到 `Aide: openai Key` 配置项中。

这里有一个视频可能能帮助到你：

<Video src="/videos/aide-customize-configuration.mp4"/>

::: warning 警告

如果你用非 ==OpenAI== 官方的接口，你可能还要配置 `Aide: Openai Base Url` 和 `Aide: Openai Model`。

配置方法和上面一样。

:::

## 我没有 ==OpenAI Key==

当你没有 ==OpenAI Key== 时，你可以通过以下几种方法获取一个：

::: details 我想获取官方 ==OpenAI Key==

- 获取官方的 ==OpenAI Key==，请参考[OpenAI 官方](https://platform.openai.com)。
- 这需要你有 ==OpenAI== 开放国家的手机号以及信用卡。（中国不在其中）
- 如果你是中国用户，你可能还需要准备代理访问。
- ==OpenAI== 的 API 调用方式所有模型都是收费的，它和 `Chatgpt web 版` 是区别开来的，所以你必须绑定信用卡。

:::

::: details 我是中国用户，但也想用 ==OpenAI==

- 如果你是中国用户，你可以通过 ==Aide== 提供的[模型聚合转发服务](../use-another-llm/aide-models.md)来使用 ==OpenAI==。
- 它比官方价格还便宜，而且不用挂代理。
- 同时你还能使用非常多家供应商的模型。
- 具体请参考[Aide 模型聚合](../use-another-llm/aide-models.md)。

:::

::: details 我希望用 ==OpenAI== 以外的模型

- 我喜欢使用在线模型：

  - [Aide 模型聚合](../use-another-llm/aide-models.md)
  - [Anthropic](../use-another-llm/anthropic.md)
  - [Azure](../use-another-llm/azure.md)
  - [DeepSeek](../use-another-llm/deepseek.md)
  - [谷歌](../use-another-llm/google.md)
  - [讯飞](../use-another-llm/iflytek.md)
  - [通义千问](../use-another-llm/qwen.md)
  - [智谱](../use-another-llm/zhipu.md)

- 我喜欢使用离线模型：
  - [LocalAI](../use-another-llm/local-ai.md)
  - [Ollama](../use-another-llm/ollama.md)

:::
