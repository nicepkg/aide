import type { ExtensionContext, Webview } from 'vscode'

export {}
declare global {
  /**
   * fix code hint
   */
  type UnionType<T> = T | (string & {})

  namespace NodeJS {
    interface ProcessEnv {
      /**
       * Node.js environment
       */
      NODE_ENV: UnionType<'development' | 'production'>
      /**
       * `[vite serve]` The url of the vite dev server.
       */
      VITE_DEV_SERVER_URL?: string
      /**
       * `[vite build]` All js files in the dist directory, excluding index.js. It's to be a json string.
       */
      VITE_WEBVIEW_DIST?: string
    }
  }

  /**
   *  `[vite serve]` Gets the html of webview in development mode.
   * @param options serverUrl: The url of the vite dev server.
   */
  function __getWebviewHtml__(options?: string | { serverUrl: string }): string

  /**
   *  `[vite build]` Gets the html of webview in production mode.
   * @param webview The Webview instance of the extension.
   * @param context The ExtensionContext instance of the extension.
   * @param inputName vite build.rollupOptions.input name. Default is `index`.
   */
  function __getWebviewHtml__(
    webview: Webview,
    context: ExtensionContext,
    inputName?: string
  ): string
}
