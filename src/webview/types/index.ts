export type Account = {
  id: string;
  name: string;
  apiKey: string;
  assistants: string[];
  models: string[];
  conversations: Conversation[];
}

export type Conversation = {
  id: number;
  title: string;
  date: string;
  messages: number;
  lastMessage: string;
}

export interface VSCodeAPI {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

declare global {
  interface Window {
    acquireVsCodeApi(): VSCodeAPI;
  }
}
