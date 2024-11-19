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

    async storeAccount(account: { id: string, name: string, apiKey: string }): Promise<void> {
        // Store API key in SecretStorage
        await this.context.secrets.store(`openai-key-${account.id}`, account.apiKey);

        // Store account info (without API key) in GlobalState
        const accounts = this.getAccounts();
        const accountInfo = {
            id: account.id,
            name: account.name
        };
        accounts.push(accountInfo);
        await this.context.globalState.update('openai-accounts', accounts);
    }

    async getApiKey(accountId: string): Promise<string | undefined> {
        return await this.context.secrets.get(`openai-key-${accountId}`);
    }

    getAccounts(): Array<{ id: string, name: string }> {
        return this.context.globalState.get('openai-accounts', []);
    }

    async deleteAccount(accountId: string): Promise<void> {
        // Remove API key from SecretStorage
        await this.context.secrets.delete(`openai-key-${accountId}`);

        // Remove account from GlobalState
        const accounts = this.getAccounts();
        const filteredAccounts = accounts.filter(acc => acc.id !== accountId);
        await this.context.globalState.update('openai-accounts', filteredAccounts);
    }
}
