export type Account = {
  id: string;
  name: string;
  apiKey?: string;
  assistants: string[];
  models: string[];
  conversations: Conversation[];
}

export interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: string
}

export type Conversation = {
  id: string;
  title: string;
  date: string;
  messages: Message[];
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
