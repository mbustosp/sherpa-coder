import { Account } from '@/types';
import * as vscode from 'vscode';


export class AccountManager {
    private static instance: AccountManager;
    private constructor(
        private context: vscode.ExtensionContext
    ) {}

    static getInstance(context: vscode.ExtensionContext): AccountManager {
        if (!AccountManager.instance) {
            AccountManager.instance = new AccountManager(context);
        }
        return AccountManager.instance;
    }

    async storeAccount(account: Account): Promise<void> {
        console.log(`Storing account with ID: ${account.id}`);
        
        if (account.apiKey) {
            await this.context.secrets.store(`openai-key-${account.id}`, account.apiKey);
        }
           
        console.log('API key stored in secrets');

        const accountInfo = {
            id: account.id,
            name: account.name,
            assistants: account.assistants,
            models: account.models,
            conversations: account.conversations
        };
        console.log('Account info prepared:', accountInfo);
        
        const accounts = this.getAccounts();
        console.log('Current accounts count:', accounts.length);
        
        const existingIndex = accounts.findIndex(acc => acc.id === account.id);
        if (existingIndex !== -1) {
            accounts[existingIndex] = accountInfo;
        } else {
            accounts.push(accountInfo);
        }
        
        await this.context.globalState.update('openai-accounts', accounts);
        console.log('Account successfully stored in global state');
    }
    async getApiKey(accountId: string): Promise<string | undefined> {
        return await this.context.secrets.get(`openai-key-${accountId}`);
    }

    getAccounts(): Account[] {
        return this.context.globalState.get('openai-accounts', []);
    }

    async deleteAccount(accountId: string): Promise<void> {
        await this.context.secrets.delete(`openai-key-${accountId}`);
        const accounts = this.getAccounts();
        const filteredAccounts = accounts.filter(acc => acc.id !== accountId);
        await this.context.globalState.update('openai-accounts', filteredAccounts);
    }
}