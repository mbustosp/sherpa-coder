import { reducer, initialState } from '../webview/providers/globalState/reducer';
import { Account, Conversation, Assistant, Model, Message, OpenAIClientStatus } from '../types';

describe('Global State Reducer', () => {
  test('UPDATE_ACCOUNTS', () => {
    const mockAccounts: Account[] = [{
      id: '1', name: 'Test Account', apiKey: 'key1',
      conversations: [], assistants: [], models: []
    }];
    
    const newState = reducer(initialState, {
      type: 'UPDATE_ACCOUNTS',
      payload: { accounts: mockAccounts, selectedAccountId: '1' }
    });

    expect(newState.accounts).toEqual(mockAccounts);
    expect(newState.selectedAccountId).toBe('1');
  });

  test('SET_SELECTED_ACCOUNT_ID', () => {
    const newState = reducer(initialState, {
      type: 'SET_SELECTED_ACCOUNT_ID',
      payload: '1'
    });
    expect(newState.selectedAccountId).toBe('1');
  });

  test('SET_IS_LOADING', () => {
    const newState = reducer(initialState, {
      type: 'SET_IS_LOADING',
      payload: true
    });
    expect(newState.isLoading).toBe(true);
  });

  test('SET_ERROR and DISMISS_ERROR', () => {
    const errorState = reducer(initialState, {
      type: 'SET_ERROR',
      payload: 'Test error'
    });
    expect(errorState.error).toBe('Test error');

    const dismissedState = reducer(errorState, { type: 'DISMISS_ERROR' });
    expect(dismissedState.error).toBeNull();
  });

  test('SET_NEW_ACCOUNT_NAME', () => {
    const newState = reducer(initialState, {
      type: 'SET_NEW_ACCOUNT_NAME',
      payload: 'New Account'
    });
    expect(newState.newAccountName).toBe('New Account');
  });

  test('SET_NEW_ACCOUNT_API_KEY', () => {
    const newState = reducer(initialState, {
      type: 'SET_NEW_ACCOUNT_API_KEY',
      payload: 'new-api-key'
    });
    expect(newState.newAccountApiKey).toBe('new-api-key');
  });

  test('SET_CURRENT_CONVERSATION', () => {
    const mockConversation: Conversation = {
      id: '1',
      title: 'Test Chat',
      date: new Date().toISOString(),
      messages: [],
      lastMessage: ''
    };

    const newState = reducer(initialState, {
      type: 'SET_CURRENT_CONVERSATION',
      payload: mockConversation
    });
    expect(newState.currentConversation).toEqual(mockConversation);
  });

  test('UPDATE_CONVERSATION', () => {
    const initialStateWithAccount = {
      ...initialState,
      accounts: [{
        id: '1',
        name: 'Test',
        apiKey: 'key',
        conversations: [],
        assistants: [],
        models: []
      }],
      selectedAccountId: '1'
    };

    const mockConversation: Conversation = {
      id: '1',
      title: 'Updated Chat',
      date: new Date().toISOString(),
      messages: [],
      lastMessage: ''
    };

    const newState = reducer(initialStateWithAccount, {
      type: 'UPDATE_CONVERSATION',
      payload: mockConversation
    });
    expect(newState.currentConversation).toEqual(mockConversation);
  });

  test('SET_IS_ASSISTANT_TYPING', () => {
    const newState = reducer(initialState, {
      type: 'SET_IS_ASSISTANT_TYPING',
      payload: true
    });
    expect(newState.isAssistantTyping).toBe(true);
    expect(newState.isLoading).toBe(true);
  });

  test('SET_OPEN_AI_CLIENT_STATUS and DISMISS_OPEN_AI_CLIENT_STATUS', () => {
    const status: OpenAIClientStatus = {
      status: 'connected',
      assistantsCount: 5,
      modelsCount: 3
    };

    const newState = reducer(initialState, {
      type: 'SET_OPEN_AI_CLIENT_STATUS',
      payload: status
    });
    expect(newState.openAIClientStatus).toEqual(status);

    const dismissedState = reducer(newState, { type: 'DISMISS_OPEN_AI_CLIENT_STATUS' });
    expect(dismissedState.openAIClientStatus.status).toBe('idle');
  });

  test('SET_ASSISTANTS', () => {
    const mockAssistants: Assistant[] = [{
      id: 'asst1',
      name: 'Assistant 1',
      description: 'Test assistant',
      model: 'gpt-4'
    }];

    const newState = reducer(initialState, {
      type: 'SET_ASSISTANTS',
      payload: mockAssistants
    });
    expect(newState.assistants).toEqual(mockAssistants);
    expect(newState.selectedAssistant).toBe('asst1');
  });

  test('SET_MODELS', () => {
    const mockModels: Model[] = [{
      id: 'model1',
      name: 'GPT-4',
      created: Date.now(),
      owned_by: 'openai'
    }];

    const newState = reducer(initialState, {
      type: 'SET_MODELS',
      payload: mockModels
    });
    expect(newState.models).toEqual(mockModels);
    expect(newState.selectedModel).toBe('model1');
  });

  test('SET_SELECTED_ASSISTANT', () => {
    const newState = reducer(initialState, {
      type: 'SET_SELECTED_ASSISTANT',
      payload: 'asst1'
    });
    expect(newState.selectedAssistant).toBe('asst1');
  });

  test('SET_SELECTED_MODEL', () => {
    const newState = reducer(initialState, {
      type: 'SET_SELECTED_MODEL',
      payload: 'model1'
    });
    expect(newState.selectedModel).toBe('model1');
  });

  test('SET_LOADING_MODELS_AND_ASSISTANTS', () => {
    const newState = reducer(initialState, {
      type: 'SET_LOADING_MODELS_AND_ASSISTANTS',
      payload: true
    });
    expect(newState.loadingModelsAndAssistants).toBe(true);
  });

  test('SET_WORKSPACE_FILES', () => {
    const mockFiles = ['file1.ts', 'file2.ts'];
    const newState = reducer(initialState, {
      type: 'SET_WORKSPACE_FILES',
      payload: mockFiles
    });
    expect(newState.workspaceFiles).toEqual(mockFiles);
  });

  test('TOGGLE_FULL_SCREEN', () => {
    const newState = reducer(initialState, { type: 'TOGGLE_FULL_SCREEN' });
    expect(newState.isFullScreen).toBe(true);
  });

  test('SET_IS_CLIENT_INITIALIZED', () => {
    const newState = reducer(initialState, {
      type: 'SET_IS_CLIENT_INITIALIZED',
      payload: true
    });
    expect(newState.isClientInitialized).toBe(true);
  });

  test('UPDATE_MESSAGE', () => {
    const mockConversation: Conversation = {
      id: '1',
      title: 'Test Chat',
      date: new Date().toISOString(),
      messages: [],
      lastMessage: ''
    };

    const stateWithConversation = {
      ...initialState,
      currentConversation: mockConversation
    };

    const messagePayload = {
      messageId: 'msg1',
      content: 'Hello',
      modelName: 'gpt-4',
      assistantName: 'Assistant',
      timestamp: Date.now()
    };

    const newState = reducer(stateWithConversation, {
      type: 'UPDATE_MESSAGE',
      payload: messagePayload
    });

    expect(newState.currentConversation?.messages[0]).toMatchObject({
      id: messagePayload.messageId,
      content: messagePayload.content,
      modelName: messagePayload.modelName,
      assistantName: messagePayload.assistantName
    });
  });
});
