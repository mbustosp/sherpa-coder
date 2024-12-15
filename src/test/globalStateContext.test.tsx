// src/webview/providers/globalState/globalStateContext.test.tsx

import React from 'react';
import { render, act, fireEvent, waitFor } from '@testing-library/react';
import { GlobalStateProvider, useGlobalContext } from '@/webview/providers/globalState/globalStateContext';



// Access the mocked sendMessage
const { sendMessage } = require('@/core/VSCodeAPI');

// A test component to access and use the global context
const TestComponent: React.FC = () => {
    const context = useGlobalContext();

    return (
        <div>
            <button onClick={() => context.selectAccount('test-account-id')}>
                Select Account
            </button>
            <button onClick={() => context.setNewAccountName('Test Account')}>
                Set Account Name
            </button>
            <button onClick={() => context.setNewAccountApiKey('test-api-key')}>
                Set API Key
            </button>
            <button onClick={() => context.handleCreateAccount()}>
                Create Account
            </button>
            <button onClick={() => context.toggleFullScreen()}>
                Toggle Full Screen
            </button>
            <button onClick={() => context.handleSendChatMessage('Hello', [])}>
                Send Chat Message
            </button>
            <button onClick={() => context.handleDeleteAccount('test-account-id')}>
                Delete Account
            </button>
            <button onClick={() => context.dismissError()}>
                Dismiss Error
            </button>
            <button onClick={() => context.setCurrentConversation(null)}>
                Set Conversation
            </button>
            <div data-testid="isFullScreen">
                {context.isFullScreen.toString()}
            </div>
            <div data-testid="selectedAccountId">
                {context.selectedAccountId || ''}
            </div>
            <div data-testid="newAccountName">
                {context.newAccountName}
            </div>
            <div data-testid="newAccountApiKey">
                {context.newAccountApiKey}
            </div>
            <div data-testid="errorMessage">
                {context.error || ''}
            </div>
        </div>
    );
};

jest.mock('@/core/VSCodeAPI', () => ({
    sendMessage: jest.fn(),
}));

jest.mock('uuid', () => ({
    v4: () => 'test-uuid'
}));

describe('GlobalStateContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('provides initial state', () => {
        const { getByTestId } = render(
            <GlobalStateProvider>
                <TestComponent />
            </GlobalStateProvider>
        );

        expect(getByTestId('isFullScreen').textContent).toBe('false');
        expect(getByTestId('selectedAccountId').textContent).toBe('');
        expect(getByTestId('newAccountName').textContent).toBe('');
        expect(getByTestId('newAccountApiKey').textContent).toBe('');
    });

    test('handles selectAccount action', () => {
        const { getByText } = render(
            <GlobalStateProvider>
                <TestComponent />
            </GlobalStateProvider>
        );

        fireEvent.click(getByText('Select Account'));

        expect(sendMessage).toHaveBeenCalledWith('selectAccount', {
            accountId: 'test-account-id',
        });
    });

    test('handles setNewAccountName action', () => {
        const { getByText, getByTestId } = render(
            <GlobalStateProvider>
                <TestComponent />
            </GlobalStateProvider>
        );

        fireEvent.click(getByText('Set Account Name'));

        expect(getByTestId('newAccountName').textContent).toBe('Test Account');
    });

    test('handles setNewAccountApiKey action', () => {
        const { getByText, getByTestId } = render(
            <GlobalStateProvider>
                <TestComponent />
            </GlobalStateProvider>
        );

        fireEvent.click(getByText('Set API Key'));

        expect(getByTestId('newAccountApiKey').textContent).toBe('test-api-key');
    });

    test('handles handleCreateAccount action', () => {
        const { getByText, getByTestId } = render(
            <GlobalStateProvider>
                <TestComponent />
            </GlobalStateProvider>
        );

        fireEvent.click(getByText('Set Account Name'));
        fireEvent.click(getByText('Set API Key'));
        fireEvent.click(getByText('Create Account'));

        expect(sendMessage).toHaveBeenCalledWith('createAccount', {
            account: expect.objectContaining({
                id: 'test-uuid',
                name: 'Test Account',
                apiKey: 'test-api-key',
                conversations: [],
                assistants: [],
                models: [],
            }),
        });

        expect(getByTestId('newAccountName').textContent).toBe('');
        expect(getByTestId('newAccountApiKey').textContent).toBe('');
    });

    test('handles toggleFullScreen action', () => {
        const { getByText, getByTestId } = render(
            <GlobalStateProvider>
                <TestComponent />
            </GlobalStateProvider>
        );

        fireEvent.click(getByText('Toggle Full Screen'));

        expect(getByTestId('isFullScreen').textContent).toBe('true');

        fireEvent.click(getByText('Toggle Full Screen'));

        expect(getByTestId('isFullScreen').textContent).toBe('false');
    });

    test('handles handleSendChatMessage action', async () => {
        const { getByText } = render(
            <GlobalStateProvider>
                <TestComponent />
            </GlobalStateProvider>
        );

        sendMessage.mockClear();

        await act(async () => {
            // First update accounts and selected account
            window.postMessage({
                command: 'updateAccounts',
                accounts: [{
                    id: 'test-account-id',
                    name: 'Test Account',
                    apiKey: 'test-api-key',
                    conversations: [],
                    assistants: [],
                    models: [],
                }],
                selectedAccountId: 'test-account-id'
            }, '*');

            // Then set current conversation
            window.postMessage({
                command: 'updateConversation',
                conversation: {
                    id: 'test-conversation-id',
                    title: 'Test Conversation',
                    date: new Date().toISOString(),
                    messages: [],
                    lastMessage: '',
                }
            }, '*');

            // Finally update lists
            window.postMessage({
                command: 'updateLists',
                assistants: [{ id: 'assistant-id', name: 'Test Assistant', model: 'model-id' }],
                models: [{ id: 'model-id', name: 'Test Model', created: Date.now(), owned_by: 'test' }],
            }, '*');
        });

        // Wait for the selectedAccountId to be updated in the state
        await waitFor(() => {
            expect(getByText('test-account-id'));
        })

        fireEvent.click(getByText('Send Chat Message'));

        expect(sendMessage).toHaveBeenCalledWith('sendChatMessage', {
            accountId: 'test-account-id',
            conversationId: 'test-conversation-id',
            message: 'Hello',
            assistant: {
                id: 'assistant-id',
                name: 'Test Assistant',
            },
            fileContexts: [],
            model: {
                id: 'model-id',
                name: 'model-id',
            },
        });
    });



    test('handles handleDeleteAccount action', () => {
        const { getByText } = render(
            <GlobalStateProvider>
                <TestComponent />
            </GlobalStateProvider>
        );

        fireEvent.click(getByText('Delete Account'));

        expect(sendMessage).toHaveBeenCalledWith('deleteAccount', {
            accountId: 'test-account-id',
        });
    });

    test('handles dismissError action', async () => {
        const { getByText, getByTestId } = render(
            <GlobalStateProvider>
                <TestComponent />
            </GlobalStateProvider>
        );

        await act(async () => {
            window.postMessage(
                {
                    command: 'error',
                    message: 'Test error'
                },
                '*'
            );
        });

        await waitFor(() => {
            expect(getByTestId('errorMessage').textContent).toBe('Test error');
        });

        fireEvent.click(getByText('Dismiss Error'));
        expect(getByTestId('errorMessage').textContent).toBe('');
    });

    test('handles setCurrentConversation action', () => {
        const { getByText } = render(
            <GlobalStateProvider>
                <TestComponent />
            </GlobalStateProvider>
        );

        fireEvent.click(getByText('Set Conversation'));

        // The current conversation state will be reflected in other UI elements
        // Add appropriate data-testid in TestComponent to verify the state
        expect(sendMessage).toHaveBeenCalledWith('initClient', {});
    });
});
