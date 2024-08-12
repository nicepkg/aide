import { saveImage, setupHtml } from '@extension/utils'
import type { WebviewToExtensionsMsg } from '@shared/types/msg'
import * as vscode from 'vscode'

class AideWebViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'aide.webview'

  private _view?: vscode.WebviewView

  private disposables: vscode.Disposable[] = []

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView
    // context: vscode.WebviewViewResolveContext,
    // _token: vscode.CancellationToken
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    }

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)

    this.disposables.push(
      webviewView.webview.onDidReceiveMessage(
        async (message: WebviewToExtensionsMsg) => {
          switch (message.type) {
            case 'save-img':
              await saveImage(message.data)
              break
            case 'show-settings':
              await vscode.commands.executeCommand(
                'workbench.action.openSettings',
                `@ext:aide-pro`
              )
              break
            default:
              break
          }
        },
        undefined,
        this.disposables
      )
    )

    webviewView.onDidDispose(() => {
      while (this.disposables.length) {
        const disposable = this.disposables.pop()
        if (disposable) {
          disposable.dispose()
        }
      }
    })
  }

  public reveal() {
    if (this._view) {
      this._view.show?.(true)
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return setupHtml(webview, this._context)
  }
}

export async function renderWebview(
  context: vscode.ExtensionContext
): Promise<VoidFunction> {
  const provider = new AideWebViewProvider(context.extensionUri, context)
  const disposable = vscode.window.registerWebviewViewProvider(
    AideWebViewProvider.viewType,
    provider
  )

  context.subscriptions.push(disposable)

  provider.reveal()

  return () => {
    disposable.dispose()
  }
}
