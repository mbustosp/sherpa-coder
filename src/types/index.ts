import { sendMessage } from "@/core/VSCodeAPI";

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
  threadId?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  attachments?: { url: string, path: string, fileName: string }[];
  modelName: string;
  assistantName: string;
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

/**
* Represents the status of the OpenAI client.
*/
export interface OpenAIClientStatus {
  status:
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'retrievingAssistants'
  | 'retrievingModels'
  | 'done';
  error?: string;
  assistantsCount?: number;
  modelsCount?: number;
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

export interface GlobalState {
  accounts: Account[];
  selectedAccount?: Account;
  selectedAccountId: string | null;
  currentConversation: Conversation | null;
  isFullScreen: boolean;
  error: string | null;
  isLoading: boolean;
  isAssistantTyping: boolean;
  openAIClientStatus: OpenAIClientStatus;
  assistants: Assistant[];
  models: Model[];
  selectedAssistant: string;
  selectedModel: string;
  loadingModelsAndAssistants: boolean;
  workspaceFiles: string[];
  newAccountName: string;
  newAccountApiKey: string;
  isClientInitialized: boolean;
}

export interface GlobalActions {
  // All function types here
  dismissOpenAIClientStatus: () => void;
  sendMessageToExtension: typeof sendMessage;
  selectAccount: (accountId: string) => void;
  setNewAccountName: (name: string) => void;
  setNewAccountApiKey: (apiKey: string) => void;
  handleCreateAccount: () => void;
  handleDeleteAccount: (accountId: string) => void;
  handleRemoveExtensionData: () => void;
  dismissError: () => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  handleSendChatMessage: (messageContent: string, contextItems: ContextItem[]) => void;
  handleDeleteConversation: (conversationId: string) => void;
  setSelectedAssistant: (assistantId: string) => void;
  setSelectedModel: (modelId: string) => void;
  handleCancelRun: () => void;
  requestWorkspaceFiles: () => void;
  refreshModelsAndAssistants: () => void;
  openFile: (filePath: string) => void;
  createNewConversation: (title: string) => void;
  toggleFullScreen: () => void;
  displayToastMessage: (message: string, type?: 'success' | 'warning' | 'error') => void;
}