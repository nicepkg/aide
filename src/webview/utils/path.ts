export const toUnixPath = (path: string) => path.replace(/[\\/]+/g, '/')

export const toPlatformPath = (path: string): string => {
  const unixPath = toUnixPath(path)
  if (window.isWin) return unixPath.replace(/\//g, '\\')
  return unixPath
}

export const getFileNameFromPath = (path: string) => {
  const normalizedPath = toUnixPath(path).replace(/\/$/, '')
  return normalizedPath.split('/').pop() || ''
}

const getPathSep = () => (window.isWin ? '\\' : '/')
const pathSplitRegexp = /[/\\]/

export const pathDirname = (path: string): string => {
  const pathSep = getPathSep()
  const normalizedPath = toPlatformPath(path).replace(
    new RegExp(`${pathSep}$`),
    ''
  )
  const parts = normalizedPath.split(pathSep)

  if (parts.length === 1) {
    return window.isWin && /^[A-Z]:$/.test(normalizedPath)
      ? normalizedPath
      : '.'
  }

  if (window.isWin && parts.length === 2 && /^[A-Z]:$/.test(parts[0] || '')) {
    return normalizedPath
  }

  return parts.slice(0, -1).join(pathSep) || pathSep
}

export const pathJoin = (...parts: string[]): string =>
  parts.filter(Boolean).join(getPathSep())

export const pathIsAbsolute = (path: string): boolean => {
  if (window.isWin) {
    return /^([A-Z]:[\\/]|\\\\)/.test(path)
  }
  return path.startsWith('/')
}

export const pathRelative = (from: string, to: string): string => {
  const fromParts = from.split(pathSplitRegexp)
  const toParts = to.split(pathSplitRegexp)

  if (
    window.isWin &&
    fromParts[0] !== toParts[0] &&
    /^[A-Z]:$/.test(fromParts[0] || '') &&
    /^[A-Z]:$/.test(toParts[0] || '')
  ) {
    // if different drive, return target path directly
    return to
  }

  while (
    fromParts.length > 0 &&
    toParts.length > 0 &&
    fromParts[0] === toParts[0]
  ) {
    fromParts.shift()
    toParts.shift()
  }

  return pathJoin(...Array(fromParts.length).fill('..'), ...toParts)
}
