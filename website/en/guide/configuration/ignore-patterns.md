# aide.ignorePatterns

This configuration allows you to customize ==file exclusion rules==. It supports [glob](https://github.com/isaacs/node-glob) patterns.

- **Default value:**

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

- **Usage example:**

  For instance, to exclude the `node_modules`, `.git`, `dist`, and `build` folders from AI suggestions, you can update the settings as follows:

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
