export const vscode = window.acquireVsCodeApi();

export const sendMessage = (type: string, payload: any) => {
  console.debug('Sending message to VS Code:', { type, payload });
  vscode.postMessage({ type, payload });
};
