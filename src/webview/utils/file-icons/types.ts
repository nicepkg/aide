// see https://github.com/PKief/vscode-material-icon-theme/blob/main/src/models/icons/files/fileIcon.ts

/**
 * Defines icon packs that can be toggled.
 */
export enum IconPack {
  Angular = 'angular',
  Nest = 'nest',
  Ngrx = 'angular_ngrx',
  React = 'react',
  Redux = 'react_redux',
  Qwik = 'qwik',
  Vue = 'vue',
  Vuex = 'vue_vuex'
}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

interface BasicFileIcon {
  /**
   * Name of the icon, e.g. 'javascript'
   */
  name: string

  /**
   * Define the file extensions that should use this icon.
   * E.g. ['js']
   */
  fileExtensions?: string[]

  /**
   * Define if there are some static file names that should apply this icon.
   * E.g. ['sample.js']
   */
  fileNames?: string[]

  /**
   * Define if there is a light icon available.
   */
  light?: boolean

  /**
   * Define if there is a high contrast icon available.
   */
  highContrast?: boolean

  /**
   * Define if the icon should be disabled.
   */
  disabled?: boolean

  /**
   * Defines a pack to which this icon belongs. A pack can be toggled and all icons inside this pack can be enabled or disabled together.
   */
  enabledFor?: IconPack[]
}

/**
 * Type for a FileIcon. In addition to the `name` property, either a `fileExtensions` or `fileNames` property is required.
 */
export type FileIcon = RequireAtLeastOne<
  BasicFileIcon,
  'fileExtensions' | 'fileNames'
>

export interface DefaultIcon {
  /**
   * Name of the icon, e.g. 'src'
   */
  name: string

  /**
   * Define if there is a light icon available.
   */
  light?: boolean

  /**
   * Define if there is a high contrast icon available.
   */
  highContrast?: boolean
}

export interface FileIcons {
  /**
   * Define the default icon for folders.
   */
  defaultIcon: DefaultIcon

  /**
   * Defines all folder icons.
   */
  icons: FileIcon[]
}

export interface FolderIcon {
  /**
   * Name of the icon, e.g. 'src'
   */
  name: string

  /**
   * Define the folder names that should apply the icon.
   * E.g. ['src', 'source']
   */
  folderNames: string[]

  /**
   * Define if there is a light icon available.
   */
  light?: boolean

  /**
   * Define if there is a high contrast icon available.
   */
  highContrast?: boolean

  /**
   * Define if the icon should be disabled.
   */
  disabled?: boolean

  /**
   * Defines a pack to which this icon belongs. A pack can be toggled and all icons inside this pack can be enabled or disabled together.
   */
  enabledFor?: IconPack[]
}

export interface FolderTheme {
  /**
   * Name of the theme
   */
  name: string

  /**
   * Define the default icon for folders in a theme.
   */
  defaultIcon: DefaultIcon

  /**
   * Icon for root folders.
   */
  rootFolder?: DefaultIcon

  /**
   * Defines folder icons for specific folder names.
   */
  icons?: FolderIcon[]
}
