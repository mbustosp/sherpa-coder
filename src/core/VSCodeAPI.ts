import log from "@/utils/logger";

export const vscode = window.acquireVsCodeApi();

export const sendMessage = (type: string, payload: any) => {
  log.info('Sending message to VS Code:', { type, payload });
  vscode.postMessage({ type, payload });
};
