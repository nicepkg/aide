import type { SvgComponent } from '@webview/types/common'

import { fileIcons } from './file-icons'
import { folderIcons } from './folder-icons'
import type { FileIcons, FolderTheme } from './types'

const icons: Record<string, SvgComponent> = import.meta.glob(
  './material-icons/*.svg',
  {
    eager: true,
    query: '?react',
    import: 'default'
  }
)

/**
 * Generate react components based on icon names
 * @param iconName icon name
 * @returns react component
 */
export function getIconComponentByIconName(
  iconName: string,
  isOpen = false
): SvgComponent | undefined {
  if (isOpen) {
    const openIconName =
      icons[`./material-icons/${`${iconName}-open`}.svg`] ?? undefined

    if (openIconName) return openIconName
  }

  return icons[`./material-icons/${iconName}.svg`] ?? undefined
}

/**
 * Get the mapping table of file name and icon name
 * Get the mapping table of file extension name and icon name
 */
export function getFileIconMap(fileIcons: FileIcons) {
  const fileNameIconMap = new Map<string, string>()
  const fileExtIconMap = new Map<string, string>()
  for (const iconConfig of fileIcons.icons!) {
    const { fileNames = [], fileExtensions = [] } = iconConfig
    for (const folderName of fileNames)
      fileNameIconMap.set(folderName, iconConfig.name)

    for (const fileExt of fileExtensions)
      fileExtIconMap.set(fileExt, iconConfig.name)
  }
  return { fileNameIconMap, fileExtIconMap }
}

/**
 * Get the icon name based on the file name
 */
const { fileNameIconMap, fileExtIconMap } = getFileIconMap(fileIcons)
export function getFileIconByFileName(filename: string): string {
  const ext = filename.split('.').pop()!
  const fileIcon = fileNameIconMap.get(filename)
  const extIcon = fileExtIconMap.get(ext)
  const result = fileIcon || extIcon || fileIcons.defaultIcon.name

  return result
}

/**
 * get the mapping table of folder name and icon name
 */
export function getFolderNameIconMap(folderIcons: FolderTheme) {
  const map = new Map<string, string>()
  for (const iconConfig of folderIcons.icons!) {
    for (const folderName of iconConfig.folderNames)
      map.set(folderName, iconConfig.name)
  }
  return map
}

/**
 * Get the icon name based on the folder name
 */
const folderNameIconMap = getFolderNameIconMap(folderIcons)
export function getFolderIconByFolderName(folderName: string, isOpen = false) {
  const defaultIconName = folderIcons.defaultIcon.name
  const defaultOpenIconName = `${folderIcons.defaultIcon.name}-open`
  return (
    folderNameIconMap.get(folderName) ||
    (isOpen ? defaultOpenIconName : defaultIconName)
  )
}

export interface GetIconComponentProps {
  name: string
  isOpen?: boolean
  isFolder?: boolean
}
export function getIconComponent({
  name,
  isOpen,
  isFolder
}: GetIconComponentProps): SvgComponent | undefined {
  if (isFolder)
    return getIconComponentByIconName(getFolderIconByFolderName(name), isOpen)
  return getIconComponentByIconName(getFileIconByFileName(name))
}
