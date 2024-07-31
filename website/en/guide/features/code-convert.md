# Code Convert

Command Name: `aide.codeConvert`

Use AI to convert an entire file or selected code from one programming language to another. Supports any language. Most languages support highlighting.

You can enter any language or file extension. If it is not in the [==language list==](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers), it might not support syntax highlighting, but it can still be converted.

**Usage:**

- Select the code in the editor.
- Click the paper icon at the top right or right-click and select `✨ Aide: Code Convert`.

::: tip
If the output is interrupted, you can click the original paper icon or right-click and select `✨ Aide: Code Convert` to continue.
:::

<Video src="/videos/aide-code-convert.mp4"/>

::: tip Language + Additional Description Support

After entering the language, you can add a space and then a supplementary description. For example, if you want to migrate a `Vue2` project to `Vue3 setup`, you can enter:

`vue vue2 to vue3 <script setup> syntax`

This will be parsed as:

Target Language: `vue`

Additional Description: `vue2 to vue3 <script setup> syntax`

The rule is: Target Language + Space + Additional Description
:::

**Related Configuration:**

- By default, the editor will remember your language mappings in the current project's `.vscode/settings.json` file under the [`aide.convertLanguagePairs`](../configuration/convert-language-pairs.md) configuration, so you don't need to select the languages again next time you convert.

- You can control whether to automatically remember language mappings by modifying the [`aide.autoRememberConvertLanguagePairs`](../configuration/auto-remember-convert-language-pairs.md) configuration.
