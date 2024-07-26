# aide.useSystemProxy

This configuration allows you to customize whether to use the system proxy (`HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`) for network requests. The default is `true`.

Changes to this setting require restarting `VSCode` to take effect.

::: tip
This configuration depends on the following environment variables to obtain the system proxy:

- `HTTP_PROXY`
- `HTTPS_PROXY`
- `ALL_PROXY`

Ensure that these proxy environment variables are correctly set before using this configuration.
:::
