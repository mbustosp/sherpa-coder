import { useEffect, useState } from 'react';
import OpenAI from 'openai';
import { Account } from '../types';
import { sendMessage } from '@/vscode';

export function useOpenAI(selectedAccount: Account | null) {
    const [client, setClient] = useState<OpenAI | null>(null);
    const [assistants, setAssistants] = useState<OpenAI.Beta.Assistant[]>([]);
    const [models, setModels] = useState<OpenAI.Models.Model[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeOpenAI = async () => {
            if (!selectedAccount) {
                console.log('No account selected, clearing OpenAI state');
                setClient(null);
                setAssistants([]);
                setModels([]);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                console.log('Requesting API key for account:', selectedAccount.id);
                sendMessage('getApiKey', { accountId: selectedAccount.id });
            } catch (err) {
                console.error('Error requesting API key:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize OpenAI client');
                setIsLoading(false);
            }
        };

        const messageHandler = async (event: MessageEvent) => {
            const message = event.data;
            
            if (message.command === 'apiKey' && message.accountId === selectedAccount?.id) {
                console.log('Received API key for account:', message.accountId);
                try {
                    console.log('Initializing OpenAI client...');
                    const openai = new OpenAI({ apiKey: message.apiKey });
                    setClient(openai);

                    console.log('Fetching assistants...');
                    const assistantsResponse = await openai.beta.assistants.list();
                    console.log('Found', assistantsResponse.data.length, 'assistants');
                    setAssistants(assistantsResponse.data);

                    console.log('Fetching models...');
                    const modelsResponse = await openai.models.list();
                    const gptModels = modelsResponse.data.filter(model => 
                        model.id.startsWith('gpt-')
                    );
                    console.log('Found', gptModels.length, 'GPT models');
                    setModels(gptModels);
                    setIsLoading(false);
                } catch (err) {
                    console.error('Error initializing OpenAI:', err);
                    setError(err instanceof Error ? err.message : 'Failed to fetch OpenAI data');
                    setIsLoading(false);
                }
            }
        };

        window.addEventListener('message', messageHandler);
        initializeOpenAI();

        return () => window.removeEventListener('message', messageHandler);
    }, [selectedAccount, sendMessage]);

    return {
        client,
        assistants,
        models,
        isLoading,
        error
    };
}
