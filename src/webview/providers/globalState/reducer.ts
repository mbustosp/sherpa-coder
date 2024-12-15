import { Account, Assistant, Conversation, GlobalState, Model, OpenAIClientStatus } from '@/types';
import log from '@/utils/logger';


/**
 * The initial state for the global context.
 */
export const initialState: GlobalState = {
  accounts: [],
  selectedAccountId: null,
  currentConversation: null,
  isFullScreen: false,
  error: null,
  isLoading: false,
  isAssistantTyping: false,
  openAIClientStatus: { status: 'idle' },
  assistants: [],
  models: [],
  selectedAssistant: '',
  selectedModel: '',
  loadingModelsAndAssistants: false,
  workspaceFiles: [],
  newAccountName: '',
  newAccountApiKey: '',
  isClientInitialized: false,
  selectedAccount: undefined
};

/**
 * The action types for state management.
 */
export type Action =
  | { type: 'UPDATE_ACCOUNTS'; payload: { accounts: Account[]; selectedAccountId?: string | null } }
  | { type: 'SET_SELECTED_ACCOUNT_ID'; payload: string | null }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: Conversation | null }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'TOGGLE_FULL_SCREEN' }
  | { type: 'SET_IS_ASSISTANT_TYPING'; payload: boolean }
  | { type: 'SET_OPEN_AI_CLIENT_STATUS'; payload: OpenAIClientStatus }
  | { type: 'SET_ASSISTANTS'; payload: Assistant[] }
  | { type: 'SET_MODELS'; payload: Model[] }
  | { type: 'SET_SELECTED_ASSISTANT'; payload: string }
  | { type: 'SET_SELECTED_MODEL'; payload: string }
  | { type: 'SET_LOADING_MODELS_AND_ASSISTANTS'; payload: boolean }
  | { type: 'SET_WORKSPACE_FILES'; payload: string[] }
  | { type: 'SET_NEW_ACCOUNT_NAME'; payload: string }
  | { type: 'SET_NEW_ACCOUNT_API_KEY'; payload: string }
  | { type: 'SET_IS_CLIENT_INITIALIZED'; payload: boolean }
  | { type: 'UPDATE_MESSAGE'; payload: { messageId: string; content: string; modelName: string; assistantName: string; timestamp: number } }
  | { type: 'DISMISS_ERROR' }
  | { type: 'DISMISS_OPEN_AI_CLIENT_STATUS' }
  ;

/**
 * The reducer function for global state.
 *
 * @param state - The current global state.
 * @param action - The action to be processed.
 * @returns The new global state after applying the action.
 */
export function reducer(state: GlobalState, action: Action): GlobalState {
  log.debug('[Reducer] Action:', action.type);
  
  
  switch (action.type) {
    case 'UPDATE_ACCOUNTS':
      return {
        ...state,
        accounts: action.payload.accounts,
        selectedAccountId:
          action.payload.selectedAccountId !== undefined
            ? action.payload.selectedAccountId
            : state.selectedAccountId,
        isLoading: false,
      };
    case 'SET_SELECTED_ACCOUNT_ID':
      return {
        ...state,
        selectedAccountId: action.payload,
      };
    case 'SET_IS_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'DISMISS_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_NEW_ACCOUNT_NAME':
      return {
        ...state,
        newAccountName: action.payload,
      };
    case 'SET_NEW_ACCOUNT_API_KEY':
      return {
        ...state,
        newAccountApiKey: action.payload,
      };
    case 'SET_CURRENT_CONVERSATION':
      return {
        ...state,
        currentConversation: action.payload,
      };
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === state.selectedAccountId
            ? {
              ...account,
              conversations: account.conversations.map(conv =>
                conv.id === action.payload.id ? action.payload : conv
              ),
            }
            : account
        ),
        currentConversation: action.payload,
      };
    case 'SET_IS_ASSISTANT_TYPING':
      return {
        ...state,
        isAssistantTyping: action.payload,
        isLoading: action.payload,
      };
    case 'SET_OPEN_AI_CLIENT_STATUS':
      return {
        ...state,
        openAIClientStatus: action.payload,
      };
    case 'DISMISS_OPEN_AI_CLIENT_STATUS':
      return {
        ...state,
        openAIClientStatus: { status: 'idle' },
      };
    case 'SET_ASSISTANTS':
      return {
        ...state,
        assistants: action.payload,
        selectedAssistant: action.payload.length > 0 ? action.payload[0].id : '',
      };
    case 'SET_MODELS':
      return {
        ...state,
        models: action.payload,
        selectedModel: action.payload.length > 0 ? action.payload[0].id : '',
      };
    case 'SET_SELECTED_ASSISTANT':
      return {
        ...state,
        selectedAssistant: action.payload,
      };
    case 'SET_SELECTED_MODEL':
      return {
        ...state,
        selectedModel: action.payload,
      };
    case 'SET_LOADING_MODELS_AND_ASSISTANTS':
      return {
        ...state,
        loadingModelsAndAssistants: action.payload,
      };
    case 'SET_WORKSPACE_FILES':
      return {
        ...state,
        workspaceFiles: action.payload,
      };
    case 'TOGGLE_FULL_SCREEN':
      return {
        ...state,
        isFullScreen: !state.isFullScreen,
      };
    case 'SET_IS_CLIENT_INITIALIZED':
      return {
        ...state,
        isClientInitialized: action.payload,
      };
    case 'UPDATE_MESSAGE':
      const { messageId, content, modelName, assistantName, timestamp } = action.payload;
      if (!state.currentConversation) {
        return state;
      }

    const updatedMessages = state.currentConversation.messages.find(msg => msg.id === messageId)
      ? state.currentConversation.messages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content,
                modelName,
                assistantName,
                timestamp,
              }
            : msg
        )
      : [...state.currentConversation.messages, {
          id: messageId,
          content,
          modelName,
          assistantName,
          timestamp,
        }];

      return {
        ...state,
        currentConversation: {
          ...state.currentConversation,
          messages: updatedMessages,
        },
      };

    default:
      return state;
  }
}