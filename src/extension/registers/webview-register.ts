import type { CommandManager } from '@extension/commands/command-manager'
import { setupHtml } from '@extension/utils'
import { setupWebviewAPIManager } from '@extension/webview-api'
import type { WebviewPanel } from '@extension/webview-api/types'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'
import type { RegisterManager } from './register-manager'

export class AideWebViewProvider {
  static readonly viewType = 'aide.webview'

  private webviewPanel: vscode.WebviewPanel | undefined

  private sidebarView: vscode.WebviewView | undefined

  private disposes: vscode.Disposable[] = []

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly context: vscode.ExtensionContext,
    private readonly registerManager: RegisterManager,
    private readonly commandManager: CommandManager
  ) {}

  async resolveSidebarView(webviewView: vscode.WebviewView) {
    this.sidebarView = webviewView
    await this.setupWebview(webviewView)
  }

  async createOrShowWebviewPanel() {
    if (this.webviewPanel) {
      this.webviewPanel.reveal(vscode.ViewColumn.Beside)
    } else {
      this.webviewPanel = vscode.window.createWebviewPanel(
        AideWebViewProvider.viewType,
        'AIDE',
        {
          viewColumn: vscode.ViewColumn.Active,
          preserveFocus: true
        },
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.joinPath(this.extensionUri, 'dist/webview')
          ]
        }
      )
      await this.setupWebview(this.webviewPanel)

      this.webviewPanel.onDidDispose(
        () => {
          this.webviewPanel = undefined
        },
        null,
        this.context.subscriptions
      )
    }
  }

  private async setupWebview(webview: WebviewPanel) {
    if ('options' in webview.webview) {
      webview.webview.options = {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.extensionUri, 'dist/webview')
        ]
      }
    }

    // add socket port state to html string
    const setupWebviewAPIManagerDispose = await setupWebviewAPIManager(
      this.context,
      webview,
      this.registerManager,
      this.commandManager
    )
    this.disposes.push(setupWebviewAPIManagerDispose)

    webview.webview.html = this.getHtmlForWebview(webview.webview)

    webview.onDidDispose(() => {
      setupWebviewAPIManagerDispose.dispose()
    })
  }

  revealSidebar() {
    this.sidebarView?.show?.(true)
  }

  private getHtmlForWebview(webview: vscode.Webview) {
    return setupHtml(webview, this.context)
  }

  dispose() {
    this.disposes.forEach(dispose => dispose.dispose())
    this.disposes = []
    this.webviewPanel?.dispose()
    this.webviewPanel = undefined
    this.sidebarView = undefined
  }
}

export class WebviewRegister extends BaseRegister {
  private provider: AideWebViewProvider | undefined

  async register(): Promise<void> {
    this.provider = new AideWebViewProvider(
      this.context.extensionUri,
      this.context,
      this.registerManager,
      this.commandManager
    )

    const disposable = vscode.window.registerWebviewViewProvider(
      AideWebViewProvider.viewType,
      {
        resolveWebviewView: webviewView =>
          this.provider!.resolveSidebarView(webviewView)
      },
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
    this.context.subscriptions.push(disposable, {
      dispose: () => {
        this.provider?.dispose()
      }
    })

    this.registerManager.commandManager.registerService(
      'AideWebViewProvider',
      this.provider
    )

    this.provider.revealSidebar()
  }

  dispose(): void {
    this.provider?.dispose()
    this.provider = undefined
  }
}
