import React, { useReducer, useContext } from 'react';
import { reducer, initialState } from './reducer';
import { sendMessage } from '@/core/VSCodeAPI';
import { Account, ContextItem, Conversation, GlobalActions, GlobalState, Message } from '@/types';
import log from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * The context for the global state.
 */
const GlobalStateContext = React.createContext<GlobalState & GlobalActions | undefined>(undefined);

/**
 * The provider component that wraps the application and provides the global state.
 *
 * @param props - The component props.
 * @returns The provider component.
 */
export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    /**
     * Dismisses the OpenAI client status.
     */
    const dismissOpenAIClientStatus = () => {
        dispatch({ type: 'DISMISS_OPEN_AI_CLIENT_STATUS' });
    };

    /**
     * Sends a message to the extension.
     * @param command - The command to send.
     * @param params - The parameters to send.
     */
    const sendMessageToExtension = (command: string, params: any) => {
        sendMessage(command, params);
    };

    /**
     * Selects an account.
     * @param accountId - The ID of the account to select.
     */
    const selectAccount = (accountId: string) => {
        if (!accountId || state.openAIClientStatus.status !== 'idle') return;

        dispatch({ type: 'SET_IS_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: null });
        dispatch({ type: 'SET_SELECTED_ACCOUNT_ID', payload: accountId });
        // Send message to extension to select account
        sendMessage('selectAccount', { accountId });
    };

    /**
     * Sets the new account name.
     * @param name - The new account name.
     */
    const setNewAccountName = (name: string) => {
        dispatch({ type: 'SET_NEW_ACCOUNT_NAME', payload: name });
    };

    /**
     * Sets the new account API key.
     * @param apiKey - The new API key.
     */
    const setNewAccountApiKey = (apiKey: string) => {
        dispatch({ type: 'SET_NEW_ACCOUNT_API_KEY', payload: apiKey });
    };

    /**
     * Handles creating a new account.
     */
    const handleCreateAccount = () => {
        if (!state.newAccountName || !state.newAccountApiKey) return;

        const newAccount: Account = {
            id: uuidv4(),
            name: state.newAccountName,
            apiKey: state.newAccountApiKey,
            conversations: [],
            assistants: [],
            models: [],
        };

        dispatch({ type: 'SET_NEW_ACCOUNT_NAME', payload: '' });
        dispatch({ type: 'SET_NEW_ACCOUNT_API_KEY', payload: '' });
        dispatch({ type: 'SET_IS_LOADING', payload: true });
        sendMessage('createAccount', { account: newAccount });
    };

    /**
     * Handles deleting an account.
     * @param accountId - The ID of the account to delete.
     */
    const handleDeleteAccount = (accountId: string) => {
        dispatch({ type: 'SET_IS_LOADING', payload: true });
        sendMessage('deleteAccount', { accountId });
    };

    /**
     * Handles removing all extension data.
     */
    const handleRemoveExtensionData = () => {
        sendMessage('removeExtensionData', {});
        dispatch({ type: 'UPDATE_ACCOUNTS', payload: { accounts: [], selectedAccountId: null } });
        dispatch({ type: 'SET_NEW_ACCOUNT_NAME', payload: '' });
        dispatch({ type: 'SET_NEW_ACCOUNT_API_KEY', payload: '' });
    };

    /**
     * Dismisses the current error message.
     */
    const dismissError = () => {
        dispatch({ type: 'DISMISS_ERROR' });
    };

    /**
     * Sets the current conversation.
     * @param conversation - The conversation to set.
     */
    const setCurrentConversation = (conversation: Conversation | null) => {
        dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversation });
    };

    /**
     * Handles sending a chat message.
     * @param messageContent - The content of the message.
     * @param contextItems - The context items associated with the message.
     */
    const handleSendChatMessage = (messageContent: string, contextItems: ContextItem[]) => {
        const selectedAccount = state.accounts.find(acc => acc.id === state.selectedAccountId);
        if (!state.currentConversation || !selectedAccount) return;

        const fileContexts = contextItems
            .filter(item => ['file', 'fileContext', 'sourceCode'].includes(item.type))
            .map(item => item.name);

        const assistantName = state.assistants.find(a => a.id === state.selectedAssistant)?.name;
        const modelName = state.models.find(m => m.id === state.selectedModel)?.name;

        sendMessage('sendChatMessage', {
            accountId: selectedAccount.id,
            conversationId: state.currentConversation.id,
            message: messageContent,
            assistant: {
                id: state.selectedAssistant,
                name: assistantName,
            },
            fileContexts,
            model: {
                id: state.selectedModel,
                name: modelName,
            },
        });
    };

    /**
     * Handles deleting a conversation.
     * @param conversationId - The ID of the conversation to delete.
     */
    const handleDeleteConversation = (conversationId: string) => {
        const selectedAccount = state.accounts.find(acc => acc.id === state.selectedAccountId);
        if (!selectedAccount) return;

        if (state.currentConversation?.id === conversationId) {
            dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: null });
        }

        sendMessage('deleteConversation', {
            accountId: selectedAccount.id,
            conversationId,
        });
    };

    /**
     * Sets the selected assistant.
     * @param assistantId - The ID of the assistant to select.
     */
    const setSelectedAssistant = (assistantId: string) => {
        dispatch({ type: 'SET_SELECTED_ASSISTANT', payload: assistantId });
        sendMessage('updateAssistant', { assistantId });
    };

    /**
     * Sets the selected model.
     * @param modelId - The ID of the model to select.
     */
    const setSelectedModel = (modelId: string) => {
        dispatch({ type: 'SET_SELECTED_MODEL', payload: modelId });
        sendMessage('updateModel', { modelId });
    };

    /**
     * Handles canceling a running operation.
     */
    const handleCancelRun = () => {
        sendMessage('cancelRun', {});
    };

    /**
     * Requests the list of files in the workspace.
     */
    const requestWorkspaceFiles = () => {
        sendMessage('getWorkspaceFiles', {});
    };

    /**
     * Refreshes the list of models and assistants.
     */
    const refreshModelsAndAssistants = () => {
        dispatch({ type: 'SET_LOADING_MODELS_AND_ASSISTANTS', payload: true });
        sendMessage('refreshModelsAndAssistants', {});
    };

    /**
     * Opens a file in the workspace.
     * @param filePath - The path of the file to open.
     */
    const openFile = (filePath: string) => {
        sendMessage('openFile', { filePath });
    };

    /**
     * Creates a new conversation.
     * @param title - The title of the new conversation.
     */
    const createNewConversation = (title: string) => {
        const selectedAccount = state.accounts.find(acc => acc.id === state.selectedAccountId);
        if (!selectedAccount) return;

        const newId = uuidv4();
        const newConversation: Conversation = {
            id: newId,
            title: title || `Conversation ${newId}`,
            date: new Date().toISOString().split('T')[0],
            messages: [],
            lastMessage: '',
        };

        dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: newConversation });
        sendMessage('newConversation', {
            selectedAccount,
            conversation: newConversation,
        });
    };

    /**
     * Toggles the full-screen mode.
     */
    const toggleFullScreen = () => {
        dispatch({ type: 'TOGGLE_FULL_SCREEN' });
    };

    /**
     * Displays a toast message.
     * @param message - The message to display.
     * @param type - The type of the toast ('success' | 'warning' | 'error').
     */
    const displayToastMessage = (
        message: string,
        type: 'success' | 'warning' | 'error' = 'success'
    ) => {
        sendMessage('showToast', { message, toastType: type });
    };

    // Message handler to process incoming messages from the extension
    React.useEffect(() => {
        function messageHandler(event: MessageEvent) {
            const message = event.data;

            log.debug('[Incoming Message]', {
                command: message.command,
                payload: message,
                timestamp: new Date().toISOString(),
            });

            switch (message.command) {
                case 'updateAccounts':
                    dispatch({
                        type: 'UPDATE_ACCOUNTS',
                        payload: {
                            accounts: message.accounts,
                            selectedAccountId: message.selectedAccountId,
                        },
                    });
                    dispatch({ type: 'SET_IS_LOADING', payload: false });
                    break;
                case 'updateConversation':
                    dispatch({ type: 'UPDATE_CONVERSATION', payload: message.conversation });
                    break;
                case 'updateWorkspaceFiles':
                    dispatch({ type: 'SET_WORKSPACE_FILES', payload: message.files });
                    break;
                case 'updateLists':
                    dispatch({ type: 'SET_ASSISTANTS', payload: message.assistants });
                    dispatch({
                        type: 'SET_MODELS',
                        payload: message.models.map((model: any) => ({ ...model, name: model.id })),
                    });
                    dispatch({ type: 'SET_IS_LOADING', payload: false });
                    dispatch({ type: 'SET_LOADING_MODELS_AND_ASSISTANTS', payload: false });
                    break;
                case 'refresh-Error':
                    displayToastMessage(message.message, 'error');
                    dispatch({ type: 'SET_LOADING_MODELS_AND_ASSISTANTS', payload: false });
                    break;
                case 'error':
                    dispatch({ type: 'SET_ERROR', payload: message.message });
                    dispatch({ type: 'SET_IS_LOADING', payload: false });
                    dispatch({
                        type: 'SET_OPEN_AI_CLIENT_STATUS',
                        payload: { status: 'error', error: message.message },
                    });
                    break;
                case 'updateTypingStatus':
                    dispatch({ type: 'SET_IS_ASSISTANT_TYPING', payload: message.isTyping });
                    break;
                case 'openAIClient-Connecting':
                    dispatch({ type: 'SET_IS_LOADING', payload: true });
                    dispatch({ type: 'SET_OPEN_AI_CLIENT_STATUS', payload: { status: 'connecting' } });
                    break;
                case 'openAIClient-Connected':
                    dispatch({ type: 'SET_OPEN_AI_CLIENT_STATUS', payload: { status: 'connected' } });
                    dispatch({ type: 'SET_IS_LOADING', payload: false });
                    break;
                case 'assistants-Retrieved':
                    dispatch({
                        type: 'SET_OPEN_AI_CLIENT_STATUS',
                        payload: { status: 'retrievingAssistants', assistantsCount: message.count },
                    });
                    break;
                case 'models-Retrieved':
                    dispatch({
                        type: 'SET_OPEN_AI_CLIENT_STATUS',
                        payload: { status: 'retrievingModels', modelsCount: message.count },
                    });
                    break;
                case 'openAIClient-Done':
                    dispatch({ type: 'SET_OPEN_AI_CLIENT_STATUS', payload: { status: 'done' } });
                    dispatch({ type: 'SET_IS_LOADING', payload: false });
                    break;
                case 'updateMessage':
                    dispatch({
                        type: 'UPDATE_MESSAGE',
                        payload: {
                            messageId: message.messageId,
                            content: message.content,
                            modelName: message.modelName,
                            assistantName: message.assistantName,
                            timestamp: message.timestamp,
                        },
                    });
                    break;
                default:
                    break;
            }
        }
        
        sendMessage('initClient', {});
        window.addEventListener('message', messageHandler);
        return () => {
            window.removeEventListener('message', messageHandler);
        };
    }, [dispatch]);

    // Update isClientInitialized
    React.useEffect(() => {
        const isClientInitialized = state.models.length > 0 && state.selectedAccountId !== null && !state.isLoading;
        dispatch({ type: 'SET_IS_CLIENT_INITIALIZED', payload: isClientInitialized });
    }, [state.models, state.selectedAccountId, state.isLoading]);

    const selectedAccount = state.accounts.find(acc => acc.id === state.selectedAccountId);

    return (
        <GlobalStateContext.Provider
            value={{
                ...state,
                selectedAccount,
                dismissOpenAIClientStatus,
                sendMessageToExtension,
                selectAccount,
                setNewAccountName,
                setNewAccountApiKey,
                handleCreateAccount,
                handleDeleteAccount,
                handleRemoveExtensionData,
                dismissError,
                setCurrentConversation,
                handleSendChatMessage,
                handleDeleteConversation,
                setSelectedAssistant,
                setSelectedModel,
                handleCancelRun,
                requestWorkspaceFiles,
                refreshModelsAndAssistants,
                openFile,
                createNewConversation,
                toggleFullScreen,
                displayToastMessage,
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
};

/**
 * Custom hook to access the global state and actions.
 *
 * @returns The global state and actions.
 */
export const useGlobalContext = () => {
    const context = useContext(GlobalStateContext);
    if (context === undefined) {
        throw new Error('useGlobalContext must be used within a GlobalStateProvider');
    }
    return context;
};