export const vscode = window.acquireVsCodeApi();

export const sendMessage = (type: string, payload: any) => {
  vscode.postMessage({ type, payload });
};
