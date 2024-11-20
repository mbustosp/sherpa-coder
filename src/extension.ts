import * as vscode from 'vscode';
import * as path from 'path';
import { VSCodeEventHandler } from './EventHandler';

class SherpaChatViewProvider implements vscode.WebviewViewProvider {
    private static instance: SherpaChatViewProvider | null = null;
    private webviewView: vscode.WebviewView | undefined;
    private eventHandler: VSCodeEventHandler;

    private constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) {
        this.eventHandler = VSCodeEventHandler.getInstance(this._context);
    }

    public static getInstance(extensionUri: vscode.Uri, context: vscode.ExtensionContext): SherpaChatViewProvider {
        if (!SherpaChatViewProvider.instance) {
            SherpaChatViewProvider.instance = new SherpaChatViewProvider(extensionUri, context);
        }
        return SherpaChatViewProvider.instance;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this.webviewView = webviewView;
        this.eventHandler.registerWebviewMessageHandler(webviewView, this._context);

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this._extensionUri.fsPath, 'dist', 'webview')),
                vscode.Uri.file(path.join(this._extensionUri.fsPath, 'node_modules'))
            ]
        };

        const scriptPathOnDisk = vscode.Uri.file(
            path.join(this._extensionUri.fsPath, 'dist', 'webview', 'index.js')
        );
        const scriptUri = webviewView.webview.asWebviewUri(scriptPathOnDisk);

        const cssPathOnDisk = vscode.Uri.file(
            path.join(this._extensionUri.fsPath, 'dist', 'webview', 'styles', 'globals.css')
        );
        const cssUri = webviewView.webview.asWebviewUri(cssPathOnDisk);

        const katexCssPathOnDisk = vscode.Uri.file(
            path.join(this._extensionUri.fsPath, 'node_modules', 'katex', 'dist', 'katex.min.css')
        );
        const katexCssUri = webviewView.webview.asWebviewUri(katexCssPathOnDisk);

        webviewView.webview.html = `<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="${cssUri}">
                    <link rel="stylesheet" href="${katexCssUri}">
                </head>
                <body>
                    <div id="root"></div>
                    <script type="module" src="${scriptUri}"></script>
                </body>
            </html>`;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const chatViewProvider = SherpaChatViewProvider.getInstance(context.extensionUri, context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('sherpa-coder.welcomeView', chatViewProvider, { webviewOptions: { retainContextWhenHidden: true } })
    );

    const eventHandler = VSCodeEventHandler.getInstance(context);
    context.subscriptions.push(vscode.Disposable.from(eventHandler));
}

export function deactivate() { }