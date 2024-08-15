# FAQ

## Connection Timeout or No Response from File

**Problem Description**: Users using proxies or located in mainland China may encounter connection timeout errors.

**Solution**:

1. **Check Network Proxy Configuration**:

   - Use command terminal to test if `openai.com` (or other `API Base URL`) can be pinged.
     - Command example: `ping openai.com`.
     - Note: Being able to access the website via a browser doesn't necessarily mean the command terminal can, you may need to set the proxy for the terminal separately.
   - Set environment variable `HTTPS_PROXY`:
     - Example: `http://127.0.0.1:7890` (If using ==clash== proxy, the default port is `7890`).
     - For ==clash== users, make sure the `TUN` feature is enabled.

2. **Perform the Following Operations**:
   - Confirm the proxy configuration is correct, and restart the proxy tool if necessary.
   - Try changing the proxy or check the network connection.
   - Use an `API Base URL` that can be accessed properly.

For more details, see [GitHub Issue #17](https://github.com/nicepkg/aide/issues/17).

## Exceeding AI Model Context Limit

**Problem Description**: The AI model has a character limit for context, exceeding it may cause processing failures.

**Solution**:

1. **Process Partial Text**:

   - Most features allow users to select part of the text, then right-click to call the AI function, thus reducing the number of characters.

2. **Process in Batches**:

   - Split the text into smaller segments and process them separately.

3. **Switch Model**:
   - Use an AI model that supports a larger context.

## Unable to Use Configured Third-Party ==API Base URL==

**Problem Description**: After configuring a third-party [`API Base URL`](../configuration/openai-base-url.md), the AI functionality cannot be used properly.

**Solution**:

1. **Check the `API Base URL`**:

   - Verify that the configured `API Base URL` is correct.
   - The default `API Base URL` is `https://api.openai.com/v1`.
   - Try adding or removing `/v1` in the URL to ensure correct configuration.

2. **Confirm API Compliance with ==OpenAI== Interface Specification**:

   - Ask the provider if their API complies with ==OpenAI=='s interface specification.

3. **Check if `API Base URL` and AI model support `function_call` feature**:
   - Some functionalities use the `function_call` feature, which might not be supported by some third-party large language models.

## Command 'aide.xxxx' Not Found

**Problem Description**: When using ==Aide== functionality, it prompts `Command 'aide.xxxx' not found`.

**Solution**:

1. **Check if your VSCode version is greater than v1.82.0**:

   - ==Aide== requires ==VSCode== version greater than `v1.82.0`.

2. **Check if ==Aide== is installed correctly and is the latest version**:

   - Open the extension sidebar in ==VSCode==, search for ==Aide==, and ensure the latest version is installed.

3. **If the above methods do not work**:

   - Try restarting ==VSCode==.
   - If the issue persists, try reinstalling ==Aide==.

## ==Code Convert== Doesn't Open Language Selection Box, Always Uses Previous Settings

**Problem Description**: When using the [Code Convert](../features/code-convert.md) feature for the first time, the language was set to convert from `C` to `C++`. On subsequent attempts to convert `C` files, it defaults to `C++`. The language selection box does not appear, preventing new conversion settings.

**Solution**:

1. **Disable Memory Function**: In the current project's `.vscode/settings.json`, set [`aide.autoRememberConvertLanguagePairs`](../configuration/auto-remember-convert-language-pairs.md) to `false`.
2. **Clear Existing Convert Mapping Memory**: Remove the [`aide.convertLanguagePairs`](../configuration/convert-language-pairs.md) configuration from `.vscode/settings.json` in the current project.
3. **Ensure Correct Settings**: VSCode has both global and project-level `settings.json` files. Memory is saved in the project-level configuration by default. Check the `.vscode/settings.json` file in the project folder carefully.

For more details, see [GitHub Issue #92](https://github.com/nicepkg/aide/issues/92).

## ==Smart Paste== Shows Clipboard Empty When Pasting Images

**Problem Description**: When using the [Smart Paste](../features/smart-paste.md) feature, it prompts `Clipboard is empty`.

**Solution**:

1. [**Open VSCode Settings**](./customize-configuration.md)
2. **Enable Clipboard Image Reading**: Search for and enable [`aide.readClipboardImage`](../configuration/read-clipboard-image.md) in the settings.
3. **Other Errors Occur**: If other errors appear after enabling, it means your AI model doesn't support reading images, so you can disable it.

## ==No tools_call in message== Error

**Problem Description**: When using certain features of ==Aide==, the error `No tools_call in message` is prompted.

**Solution**:

1. **Check if the AI model supports the `function_call` feature**:

   - Inquire with the AI model provider whether the `function_call` feature is supported.
   - Choose an AI model that supports the `function_call` feature.

2. **Switch to an AI model that supports the `function_call` feature**:

   - For international models, consider the [OpenAI](../use-another-llm/openai.md) gpt-4o model.
   - For Chinese models, consider the [deepseek](../use-another-llm/deepseek.md) deepseek-coder model.

## ==Consider Supporting Other IDEs==

**Problem Description**: Will ==Aide== consider supporting other IDEs, such as ==JetBrains== and ==Visual Studio==?

**Solution**:

1. **Limited Support for ==Visual Studio==**: Due to limited resources, ==Visual Studio== may never be supported.

2. **Possibility of ==JetBrains== Support**: There is strong community demand for ==JetBrains== support, but this requires someone skilled in Kotlin, as ==JetBrains== plugins are developed in Kotlin. Currently, I lack the necessary skills to implement this. I may consider learning Kotlin and using AI to assist in migrating to ==JetBrains== after ==Aide's== main features are complete.

3. **Community Contributions Welcome**: If you have the ability to develop a ==JetBrains== version, contributions are welcome. Please reach out via [GitHub](https://github.com/nicepkg/aide/issues/91) if interested.
