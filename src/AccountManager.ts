import { Account } from "@/types";
import * as vscode from "vscode";

export class AccountManager {
  private static instance: AccountManager;
  private readonly ACCOUNTS_KEY = 'openai-accounts';
  private readonly SELECTED_ACCOUNT_KEY = "selectedAccount";

  private constructor(private context: vscode.ExtensionContext) {
    console.debug('AccountManager instance created');
  }

  static getInstance(context: vscode.ExtensionContext): AccountManager {
    console.debug('Getting AccountManager instance');
    if (!AccountManager.instance) {
      console.debug('Creating new AccountManager instance');
      AccountManager.instance = new AccountManager(context);
    }
    return AccountManager.instance;
  }

  public getSelectedAccount(): string | undefined {
    console.debug('getSelectedAccount called');
    const selectedAccount = this.context.globalState.get<string>(this.SELECTED_ACCOUNT_KEY);
    console.log(`Getting selected account: ${selectedAccount}`);
    return selectedAccount;
  }

  public async setSelectedAccount(accountId: string): Promise<void> {
    console.log(`Setting selected account to: ${accountId}`);
    await this.context.globalState.update(this.SELECTED_ACCOUNT_KEY, accountId);
    console.log('Selected account updated successfully');
  }

  async storeAccount(account: Account): Promise<void> {
    console.debug(`storeAccount called for account: ${JSON.stringify(account)}`);
    console.log(`Storing account with ID: ${account.id}`);

    if (account.apiKey) {
      console.debug('Storing API key in secrets');
      await this.context.secrets.store(
        `openai-key-${account.id}`,
        account.apiKey
      );
    }

    console.log("API key stored in secrets");

    const accountInfo = {
      id: account.id,
      name: account.name,
      assistants: account.assistants,
      models: account.models,
      conversations: account.conversations,
    };
    console.log("Account info prepared:", accountInfo);
    console.debug(`Account info details: ${JSON.stringify(accountInfo)}`);

    const accounts = this.getAccounts();
    console.log("Current accounts count:", accounts.length);
    console.debug(`Current accounts: ${JSON.stringify(accounts)}`);

    const existingIndex = accounts.findIndex((acc) => acc.id === account.id);
    console.debug(`Existing account index: ${existingIndex}`);
    if (existingIndex !== -1) {
      console.debug('Updating existing account');
      accounts[existingIndex] = accountInfo;
    } else {
      console.debug('Adding new account');
      accounts.push(accountInfo);
    }

    await this.context.globalState.update(this.ACCOUNTS_KEY, accounts);
    console.log("Account successfully stored in global state");
  }

  async getApiKey(accountId: string): Promise<string | undefined> {
    console.debug(`getApiKey called for account: ${accountId}`);
    const apiKey = await this.context.secrets.get(`openai-key-${accountId}`);
    console.debug(`API key ${apiKey ? 'found' : 'not found'} for account: ${accountId}`);
    return apiKey;
  }

  getAccounts(): Account[] {
    console.debug('getAccounts called');
    const accounts = this.context.globalState.get(this.ACCOUNTS_KEY, []);
    console.debug(`Retrieved ${accounts.length} accounts`);
    return accounts;
  }

  async deleteAccount(accountId: string): Promise<void> {
    console.debug(`deleteAccount called for ID: ${accountId}`);
    await this.context.secrets.delete(`openai-key-${accountId}`);
    console.debug('API key deleted from secrets');
    
    const accounts = this.getAccounts();
    const filteredAccounts = accounts.filter((acc) => acc.id !== accountId);
    console.debug(`Removed account. Accounts count before: ${accounts.length}, after: ${filteredAccounts.length}`);
    
    await this.context.globalState.update(this.ACCOUNTS_KEY, filteredAccounts);
    console.debug('Account successfully deleted from global state');
  }

  async deleteAllAccounts(): Promise<void> {
    console.debug('deleteAllAccounts called');
    const accounts = this.getAccounts();
    
    // Delete all API keys from secrets
    for (const account of accounts) {
      await this.context.secrets.delete(`openai-key-${account.id}`);
    }
    console.debug('All API keys deleted from secrets');

    // Clear all accounts from global state
    await this.context.globalState.update(this.ACCOUNTS_KEY, []);
    // Clear selected account
    await this.context.globalState.update(this.SELECTED_ACCOUNT_KEY, undefined);
    console.debug('All accounts and selected account cleared from global state');
  }
}