export interface Account {
    id: string;
    name: string;
    apiKey: string;
    conversations: Conversation[];
    assistants: Assistant[];
    models: Model[];
  }
  
  export interface Conversation {
    id: string;
    title: string;
    date: string;
    messages: Message[];
    lastMessage: string;
    threadId: string | null;
  }
  
  export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'assistant' | 'system';
    timestamp: string;
  }
  
  export interface Assistant {
    id: string;
    name: string;
    description?: string;
    model: string;
  }
  
  export interface Model {
    id: string;
    name: string;
    created: number;
    owned_by: string;
  }
  
  export interface ContextItem {
    type: 'file' | 'fileContext' | 'sourceCode';
    name: string;
    content?: string;
  }
  
  export interface RunStreamEvents {
    textCreated: () => void;
    textDelta: (delta: { value: string }, snapshot: string) => void;
    toolCallCreated: (toolCall: { type: string }) => void;
    toolCallDelta: (delta: {
      type: string;
      code_interpreter: {
        input?: string;
        outputs?: Array<{
          type: string;
          logs?: string;
        }>;
      };
    }, snapshot: any) => void;
    end: () => void;
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
  