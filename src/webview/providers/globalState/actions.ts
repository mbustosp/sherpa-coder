import { Account, Conversation, OpenAIClientStatus, Assistant, Model } from "@/types";

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
  // Add other actions as needed
  ;