# How to Configure ==OpenAI Key==

## I Have an ==OpenAI Key==

1. Refer to this document to open the ==Aide== settings area: [Customize Configuration](./customize-configuration.md)
2. Paste your ==OpenAI Key== into the `Aide: openai Key` configuration item.

Here is a video that might help you:

<Video src="/videos/aide-customize-configuration.mp4"/>

::: warning Warning

If you use a non-official ==OpenAI== interface, you may also need to configure `Aide: Openai Base Url` and `Aide: Openai Model`.

The configuration method is the same as above.

:::

## I Don't Have an ==OpenAI Key==

If you don't have an ==OpenAI Key==, you can obtain one in the following ways:

::: details I Want to Get an Official ==OpenAI Key==

- To get an official ==OpenAI Key==, please refer to the [OpenAI official site](https://platform.openai.com).
- This requires a phone number and credit card from a country where ==OpenAI== is available (China is not included).
- If you're a user in China, you may also need to set up a proxy for access.
- ==OpenAI== API calls for all models are charged and are separate from the `ChatGPT web version`, so you must bind a credit card.

:::

::: details I'm a Chinese User but Want to Use ==OpenAI==

- If you're a Chinese user, you can use ==OpenAI== through the [Model Aggregation and Forwarding Service](/zh/guide/use-another-llm/aide-models.md) provided by ==Aide==.
- It's cheaper than the official price and doesn't require a proxy.
- You can also use models from many other providers.
- For details, please refer to [Aide Model Aggregation](/zh/guide/use-another-llm/aide-models.md).

:::

::: details I Want to Use Models Other Than ==OpenAI==

- I like using online models:

  - [Aide Model Aggregation](/zh/guide/use-another-llm/aide-models.md)
  - [Anthropic](../use-another-llm/anthropic.md)
  - [Azure](../use-another-llm/azure.md)
  - [DeepSeek](../use-another-llm/deepseek.md)
  - [Google](../use-another-llm/google.md)
  - [iFlytek](../use-another-llm/iflytek.md)
  - [Qwen](../use-another-llm/qwen.md)
  - [Zhipu](../use-another-llm/zhipu.md)

- I like using offline models:
  - [LocalAI](../use-another-llm/local-ai.md)
  - [Ollama](../use-another-llm/ollama.md)

:::
