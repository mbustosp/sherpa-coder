import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('extension.showWebview', () => {
		const panel = vscode.window.createWebviewPanel(
			'reactWebview',
			'React Webview',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview'))
				]
			}
		);

		const scriptPathOnDisk = vscode.Uri.file(
			path.join(context.extensionPath, 'dist', 'webview', 'index.js')
		);
		const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);

		panel.webview.html = `<!DOCTYPE html>
			<html>
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
				</head>
				<body>
					<div id="root"></div>
					<script src="${scriptUri}"></script>
				</body>
			</html>`;
	});

	context.subscriptions.push(disposable);
}export function deactivate() {}