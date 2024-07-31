# aide.useSystemProxy

此配置允许您自定义==是否使用系统代理==（`HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY`）进行网络请求。更改此设置后需要重启 ==VSCode== 才生效。

- **默认值:**

  ```json
  {
    "aide.useSystemProxy": true
  }
  ```

::: tip 提示
本配置依赖于以下环境变量来获取系统代理：

- `HTTP_PROXY`
- `HTTPS_PROXY`
- `ALL_PROXY`

确保在使用本配置之前，相关的代理环境变量已正确设置。
:::
