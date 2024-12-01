
import { Account } from "@/types";
import * as vscode from "vscode";
import log from '@/utils/logger';

export class AccountManager {
  private static instance: AccountManager;
  private readonly ACCOUNTS_KEY = 'openai-accounts';
  private readonly SELECTED_ACCOUNT_KEY = "selectedAccount";

  private constructor(private context: vscode.ExtensionContext) {
    log.info('AccountManager instance created');
  }

  static getInstance(context: vscode.ExtensionContext): AccountManager {
    log.info('Getting AccountManager instance');
    if (!AccountManager.instance) {
      log.info('Creating new AccountManager instance');
      AccountManager.instance = new AccountManager(context);
    }
    return AccountManager.instance;
  }

  public getSelectedAccount(): string | undefined {
    log.info('getSelectedAccount called');
    const selectedAccount = this.context.globalState.get<string>(this.SELECTED_ACCOUNT_KEY);
    log.info(`Getting selected account: ${selectedAccount}`);
    return selectedAccount;
  }

  public async setSelectedAccount(accountId: string): Promise<void> {
    log.info(`Setting selected account to: ${accountId}`);
    await this.context.globalState.update(this.SELECTED_ACCOUNT_KEY, accountId);
    log.info('Selected account updated successfully');
  }

  async storeAccount(account: Account): Promise<void> {
    log.info(`storeAccount called for account: ${JSON.stringify(account)}`);
    log.info(`Storing account with ID: ${account.id}`);

    if (account.apiKey) {
      log.info('Storing API key in secrets');
      await this.context.secrets.store(
        `openai-key-${account.id}`,
        account.apiKey
      );
    }

    log.info("API key stored in secrets");

    const accountInfo = {
      id: account.id,
      name: account.name,
      assistants: account.assistants,
      models: account.models,
      conversations: account.conversations,
    };
    log.info("Account info prepared:", accountInfo);
    log.info(`Account info details: ${JSON.stringify(accountInfo)}`);

    const accounts = this.getAccounts();
    log.info("Current accounts count:", accounts.length);
    log.info(`Current accounts: ${JSON.stringify(accounts)}`);

    const existingIndex = accounts.findIndex((acc) => acc.id === account.id);
    log.info(`Existing account index: ${existingIndex}`);
    if (existingIndex !== -1) {
      log.info('Updating existing account');
      accounts[existingIndex] = accountInfo;
    } else {
      log.info('Adding new account');
      accounts.push(accountInfo);
    }

    await this.context.globalState.update(this.ACCOUNTS_KEY, accounts);
    log.info("Account successfully stored in global state");
  }

  async getApiKey(accountId: string): Promise<string | undefined> {
    log.info(`getApiKey called for account: ${accountId}`);
    const apiKey = await this.context.secrets.get(`openai-key-${accountId}`);
    log.info(`API key ${apiKey ? 'found' : 'not found'} for account: ${accountId}`);
    return apiKey;
  }

  getAccounts(): Account[] {
    log.info('getAccounts called');
    const accounts = this.context.globalState.get(this.ACCOUNTS_KEY, []);
    log.info(`Retrieved ${accounts.length} accounts`);
    return accounts;
  }

  async deleteAccount(accountId: string): Promise<void> {
    log.info(`deleteAccount called for ID: ${accountId}`);
    await this.context.secrets.delete(`openai-key-${accountId}`);
    log.info('API key deleted from secrets');
    
    const accounts = this.getAccounts();
    const filteredAccounts = accounts.filter((acc) => acc.id !== accountId);
    log.info(`Removed account. Accounts count before: ${accounts.length}, after: ${filteredAccounts.length}`);
    
    await this.context.globalState.update(this.ACCOUNTS_KEY, filteredAccounts);
    log.info('Account successfully deleted from global state');
  }

  async deleteAllAccounts(): Promise<void> {
    log.info('deleteAllAccounts called');
    const accounts = this.getAccounts();
    
    // Delete all API keys from secrets
    for (const account of accounts) {
      await this.context.secrets.delete(`openai-key-${account.id}`);
    }
    log.info('All API keys deleted from secrets');

    // Clear all accounts from global state
    await this.context.globalState.update(this.ACCOUNTS_KEY, []);
    // Clear selected account
    await this.context.globalState.update(this.SELECTED_ACCOUNT_KEY, undefined);
    log.info('All accounts and selected account cleared from global state');
  }
}