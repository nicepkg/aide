# Code Convert

Command Name: `aide.codeConvert`

Use AI to convert an entire file or selected code from one programming language to another. Supports any language. Most languages support highlighting.

**Usage:**

- Select the code in the editor.
- Click the paper icon at the top right or right-click and select `✨ Aide: Code Convert`.

::: tip
If the output is interrupted, you can click the original paper icon or right-click and select `✨ Aide: Code Convert` to continue.
:::

<Video src="/videos/aide-code-convert.mp4"/>

::: tip Custom Language + Additional Description Support

When selecting a custom language, you can add an additional description after the language. For example, if you want to migrate a `Vue2` project to `Vue3 setup`, you can choose `Custom language` in the input box and then enter:

`vue migrate from vue2 to vue3 <script setup> syntax`

This will be parsed as:

Target language: `vue`

Additional description: `migrate from vue2 to vue3 <script setup> syntax`

This rule is: target language + space + additional description
:::

**Related Configuration:**

- By default, the editor will remember your language mappings in the current project's `.vscode/settings.json` file under the [`aide.convertLanguagePairs`](../configuration/convert-language-pairs.md) configuration, so you don't need to select the languages again next time you convert.

- You can control whether to automatically remember language mappings by modifying the [`aide.autoRememberConvertLanguagePairs`](../configuration/auto-remember-convert-language-pairs.md) configuration.
