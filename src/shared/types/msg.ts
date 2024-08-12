export type SaveImgMsgData = {
  fileName: string
  format: string
  base64: string
}

export type ExtensionsToWebviewMsg =
  | {
      type: 'update-code'
      data: string
    }
  | {
      type: 'change-theme'
      data: 'dark' | 'light'
    }

export type WebviewToExtensionsMsg =
  | {
      type: 'save-img'
      data: SaveImgMsgData
    }
  | {
      type: 'show-settings'
      data?: undefined
    }
