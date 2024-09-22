import { aideKeyUsageInfo } from '@extension/ai/aide-key-request'
import { getConfigKey } from '@extension/config'
import { t } from '@extension/i18n'
import { AideKeyUsageStatusBarRegister } from '@extension/registers/aide-key-usage-statusbar-register'
import { formatNumber } from '@extension/utils'
import * as vscode from 'vscode'

import { BaseCommand } from '../base.command'

export class ShowAideKeyUsageInfoCommand extends BaseCommand {
  get commandName(): string {
    return 'aide.showAideKeyUsageInfo'
  }

  async run(): Promise<void> {
    const openaiBaseUrl = await getConfigKey('openaiBaseUrl')
    const openaiKey = await getConfigKey('openaiKey')

    if (!openaiBaseUrl.includes('api.zyai.online'))
      throw new Error(t('error.aideKeyUsageInfoOnlySupportAideModels'))

    const aideKeyUsageStatusBarRegister = this.commandManager.getService(
      'AideKeyUsageStatusBarRegister'
    ) as AideKeyUsageStatusBarRegister

    // show loading
    aideKeyUsageStatusBarRegister.updateStatusBar(
      `$(sync~spin) ${t('info.loading')}`
    )

    try {
      const result = await aideKeyUsageInfo({ key: openaiKey })

      if (result.success) {
        // create a nice message to show the result
        const { count, subscription } = result.data

        const totalUSD = subscription.hard_limit_usd
        const usedUSD =
          (subscription.used_quota / subscription.remain_quota) * totalUSD
        const remainUSD = totalUSD - usedUSD
        const formatUSD = (amount: number) => `$${formatNumber(amount, 2)}`
        const formatDate = (timestamp: number) => {
          if (timestamp === 0) return t('info.aideKey.neverExpires')
          return new Date(timestamp * 1000).toLocaleDateString()
        }

        const message = `${t('info.aideKey.usageInfo')}:

${t('info.aideKey.total')}: ${formatUSD(totalUSD)}

${t('info.aideKey.used')}: ${formatUSD(usedUSD)}

${t('info.aideKey.remain')}: ${formatUSD(remainUSD)}

${t('info.aideKey.callCount')}: ${count.count}

${t('info.aideKey.validUntil')}: ${formatDate(subscription.access_until)}`

        vscode.window.showInformationMessage(message, {
          modal: true
        })
      } else {
        throw new Error(`Failed to fetch usage info: ${result.message}`)
      }
    } finally {
      // restore the original text of the status bar item
      aideKeyUsageStatusBarRegister.updateStatusBar(
        `$(info) ${t('info.aideKeyUsageStatusBar.text')}`
      )
    }
  }
}
