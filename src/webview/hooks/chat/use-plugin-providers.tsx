import { Fragment, type FC } from 'react'
import type {
  CustomRenderLogPreviewProps,
  UseMentionOptionsReturns
} from '@shared/plugins/base/client/client-plugin-types'
import { usePlugin } from '@webview/contexts/plugin-context'

export const usePluginCustomRenderLogPreview = () => {
  const { getProviders } = usePlugin()
  const renders = getProviders('CustomRenderLogPreview')

  const CustomRenderLogPreview: FC<CustomRenderLogPreviewProps> = ({ log }) =>
    renders?.map((render, i) => <Fragment key={i}>{render({ log })}</Fragment>)

  return CustomRenderLogPreview
}

export const usePluginMentionOptions = (): UseMentionOptionsReturns => {
  const { mergeProviders } = usePlugin()
  const useMentionOptions = mergeProviders('useMentionOptions')

  // eslint-disable-next-line react-compiler/react-compiler
  return useMentionOptions!()
}
