import { AideKeyUsageStatusBarRegister } from './aide-key-usage-statusbar-register'
import { AutoOpenCorrespondingFilesRegister } from './auto-open-corresponding-files-register'
import { BaseRegister } from './base-register'
import { CodebaseWatcherRegister } from './codebase-watcher-register'
import { RegisterManager } from './register-manager'
import { SystemSetupRegister } from './system-setup-register'
import { TmpFileActionRegister } from './tmp-file-action-register'
import { WebviewRegister } from './webview-register'

export const setupRegisters = async (registerManager: RegisterManager) => {
  const Registers = [
    SystemSetupRegister,
    TmpFileActionRegister,
    AideKeyUsageStatusBarRegister,
    AutoOpenCorrespondingFilesRegister,
    WebviewRegister,
    CodebaseWatcherRegister
  ] satisfies (typeof BaseRegister)[]

  const promises = Registers.map(async Register => {
    await registerManager.setupRegister(Register)
  })

  await Promise.allSettled(promises)
}
