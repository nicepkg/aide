# aide.ignorePatterns

此配置允许你自定义==文件排除规则==。支持 [glob](https://github.com/isaacs/node-glob) 规则。

- **默认值：**

  ```json
  {
    "aide.ignorePatterns": [
      "**/node_modules/**",
      "**/.git/**",
      "**/__pycache__/**",
      "**/.Python/**",
      "**/.DS_Store/**",
      "**/.cache/**",
      "**/.next/**",
      "**/.nuxt/**",
      "**/.out/**",
      "**/dist/**",
      "**/.serverless/**",
      "**/.parcel-cache/**"
    ]
  }
  ```

- **使用示例：**

  例如，要从 AI 提示中排除 `node_modules`、`.git`、`dist` 和 `build` 文件夹，可以更新设置如下：

  ```json
  {
    "aide.ignorePatterns": [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**"
    ]
  }
  ```
