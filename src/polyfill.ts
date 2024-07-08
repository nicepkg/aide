const enableFetchPolyfill = async () => {
  if (!globalThis.fetch) {
    const { fetch, FormData, Headers, Request, Response, File } = await import(
      'undici'
    )

    Object.assign(globalThis, {
      fetch,
      FormData,
      Headers,
      Request,
      Response,
      File
    })
  }
}

export const enablePolyfill = async () => {
  await enableFetchPolyfill()
}
