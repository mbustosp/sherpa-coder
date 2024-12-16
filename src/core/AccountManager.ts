
import { Account } from "@/types";
import * as vscode from "vscode";
import log from '@/utils/logger';

export class AccountManager {
  private static instance: AccountManager;
  private readonly ACCOUNTS_KEY = 'openai-accounts';
  private readonly SELECTED_ACCOUNT_KEY = "selectedAccount";

  private constructor(private context: vscode.ExtensionContext) {
    log.debug('AccountManager instance created');
  }

  static getInstance(context: vscode.ExtensionContext): AccountManager {
    log.debug('Getting AccountManager instance');
    if (!AccountManager.instance) {
      log.debug('Creating new AccountManager instance');
      AccountManager.instance = new AccountManager(context);
    }
    return AccountManager.instance;
  }

  public getSelectedAccount(): string | undefined {
    log.debug('getSelectedAccount called');
    const selectedAccount = this.context.globalState.get<string>(this.SELECTED_ACCOUNT_KEY);
    log.debug(`Getting selected account: ${selectedAccount}`);
    return selectedAccount;
  }

  public async setSelectedAccount(accountId: string): Promise<void> {
    log.debug(`Setting selected account to: ${accountId}`);
    await this.context.globalState.update(this.SELECTED_ACCOUNT_KEY, accountId);
    log.debug('Selected account updated successfully');
  }

  async storeAccount(account: Account): Promise<void> {
    log.debug(`storeAccount called for account: ${JSON.stringify(account)}`);
    log.debug(`Storing account with ID: ${account.id}`);

    if (account.apiKey) {
      log.debug('Storing API key in secrets');
      await this.context.secrets.store(
        `openai-key-${account.id}`,
        account.apiKey
      );
    }

    log.debug("API key stored in secrets");

    const accountInfo = {
      id: account.id,
      name: account.name,
      assistants: account.assistants,
      models: account.models,
      conversations: account.conversations,
    };
    log.debug("Account info prepared:", accountInfo);
    log.debug(`Account info details: ${JSON.stringify(accountInfo)}`);

    const accounts = this.getAccounts();
    log.debug("Current accounts count:", accounts.length);
    log.debug(`Current accounts: ${JSON.stringify(accounts)}`);

    const existingIndex = accounts.findIndex((acc) => acc.id === account.id);
    log.debug(`Existing account index: ${existingIndex}`);
    if (existingIndex !== -1) {
      log.debug('Updating existing account');
      accounts[existingIndex] = accountInfo;
    } else {
      log.debug('Adding new account');
      accounts.push(accountInfo);
    }

    await this.context.globalState.update(this.ACCOUNTS_KEY, accounts);
    log.debug("Account successfully stored in global state");
  }

  async getApiKey(accountId: string): Promise<string | undefined> {
    log.debug(`getApiKey called for account: ${accountId}`);
    const apiKey = await this.context.secrets.get(`openai-key-${accountId}`);
    log.debug(`API key ${apiKey ? 'found' : 'not found'} for account: ${accountId}`);
    return apiKey;
  }

  getAccounts(): Account[] {
    log.debug('getAccounts called');
    const accounts = this.context.globalState.get(this.ACCOUNTS_KEY, []);
    log.debug(`Retrieved ${accounts.length} accounts`);
    return accounts;
  }

  async deleteAccount(accountId: string): Promise<void> {
    log.debug(`deleteAccount called for ID: ${accountId}`);
    await this.context.secrets.delete(`openai-key-${accountId}`);
    log.debug('API key deleted from secrets');
    
    const accounts = this.getAccounts();
    const filteredAccounts = accounts.filter((acc) => acc.id !== accountId);
    log.debug(`Removed account. Accounts count before: ${accounts.length}, after: ${filteredAccounts.length}`);
    
    await this.context.globalState.update(this.ACCOUNTS_KEY, filteredAccounts);
    
    const selectedAccount = await this.context.globalState.get(this.SELECTED_ACCOUNT_KEY);
    if (selectedAccount === accountId) {
      await this.context.globalState.update(this.SELECTED_ACCOUNT_KEY, undefined);
      log.debug('Selected account cleared from global state');
    }
    
    log.debug('Account successfully deleted from global state');
  }
  async deleteAllAccounts(): Promise<void> {
    log.debug('deleteAllAccounts called');
    const accounts = this.getAccounts();
    
    // Delete all API keys from secrets
    for (const account of accounts) {
      await this.context.secrets.delete(`openai-key-${account.id}`);
    }
    log.debug('All API keys deleted from secrets');

    // Clear all accounts from global state
    await this.context.globalState.update(this.ACCOUNTS_KEY, []);
    // Clear selected account
    await this.context.globalState.update(this.SELECTED_ACCOUNT_KEY, undefined);
    log.debug('All accounts and selected account cleared from global state');
  }
}