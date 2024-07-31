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
