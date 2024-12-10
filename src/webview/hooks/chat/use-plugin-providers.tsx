import { Fragment, type FC } from 'react'
import type {
  CustomRenderLogPreviewProps,
  UseMentionOptionsReturns,
  UseSelectedFilesReturns,
  UseSelectedImagesReturns
} from '@shared/plugins/base/client/client-plugin-types'
import { usePlugin } from '@webview/contexts/plugin-context'

export const usePluginCustomRenderLogPreview = () => {
  const { getProviders } = usePlugin()
  const renders = getProviders('CustomRenderLogPreview')

  const CustomRenderLogPreview: FC<CustomRenderLogPreviewProps> = ({ log }) =>
    renders?.map((render, i) => <Fragment key={i}>{render({ log })}</Fragment>)

  return CustomRenderLogPreview
}

export const usePluginSelectedFilesProviders = (): UseSelectedFilesReturns => {
  const { mergeProviders } = usePlugin()
  const useSelectedFiles = mergeProviders('useSelectedFiles')

  return (
    // eslint-disable-next-line react-compiler/react-compiler
    useSelectedFiles?.() || {
      selectedFiles: [],
      setSelectedFiles: () => {}
    }
  )
}

export const usePluginSelectedImagesProviders =
  (): UseSelectedImagesReturns => {
    const { mergeProviders } = usePlugin()
    const useSelectedImages = mergeProviders('useSelectedImages')

    return (
      // eslint-disable-next-line react-compiler/react-compiler
      useSelectedImages?.() || {
        selectedImages: [],
        addSelectedImage: () => {},
        removeSelectedImage: () => {}
      }
    )
  }

export const usePluginMentionOptions = (): UseMentionOptionsReturns => {
  const { mergeProviders } = usePlugin()
  const useMentionOptions = mergeProviders('useMentionOptions')

  // eslint-disable-next-line react-compiler/react-compiler
  return useMentionOptions!()
}
