import * as vscode from 'vscode';
import { AccountManager } from './AccountManager';

export class VSCodeEventHandler {
    private static instance: VSCodeEventHandler;
    private accountManager: AccountManager;
    private disposables: vscode.Disposable[] = [];
    private webviewView: vscode.WebviewView | undefined;
    private context: vscode.ExtensionContext;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.accountManager = AccountManager.getInstance(context);
        this.initializeEventListeners();
    }

    static getInstance(context: vscode.ExtensionContext): VSCodeEventHandler {
        if (!VSCodeEventHandler.instance) {
            VSCodeEventHandler.instance = new VSCodeEventHandler(context);
        }
        return VSCodeEventHandler.instance;
    }

    private initializeEventListeners(): void {
        // Add other event listeners here
    }
    public handleWebviewMessage(message: { type: string, payload: any }): void {
        // Log the incoming message with type and payload
        console.log(`[Sherpa Coder Webview Message] Received message:`, {
            type: message.type,
            payload: message.payload
        });

        switch (message.type) {
            case 'upload':
                this.handleUpload(message.payload.accountId);
                break;
            case 'newConversation':
                this.createNewConversation(message.payload.conversation);
                break;
            case 'createAccount':
                this.createAccount(message.payload.account);
                break;
            case 'deleteAccount':
                this.deleteAccount(message.payload.accountId);
                break;
            case 'getAccounts':
                this.getAccounts();
                break;
            default:
                console.log(`Unhandled message type: ${message.type}`, message.payload);
        }
    }

    private async getAccounts(): Promise<void> {
        const accounts = this.accountManager.getAccounts();
        console.log(`[Account Handler] Getting accounts:`, accounts);
        if (this.webviewView) {
            this.webviewView.webview.postMessage({
                command: 'updateAccounts',
                accounts: accounts
            });
        }
        // Implement the logic to handle getting accounts
    }

    private handleUpload(accountId: string): void {
        console.log(`[Upload Handler] Processing upload for account ID: ${accountId}`);
        // Implement the logic to handle the upload process
    }

    private createNewConversation(conversation: any): void {
        console.log(`[Conversation Handler] Creating new conversation:`, conversation);
        // Implement the logic to handle creating a new conversation
    }

    private async createAccount(account: any): Promise<void> {
            console.log(`[Account Handler] Creating new account:`, account);
            try {
                await this.accountManager.storeAccount(account);
            } catch (error) {
                console.error(`[Account Handler] Error creating account:`, error);
            }        // Implement the logic to handle creating a new account
    }

    private async deleteAccount(accountId: string): Promise<void> {
        console.log(`[Account Handler] Deleting account with ID: ${accountId}`);
        await this.accountManager.deleteAccount(accountId);
        // Implement the logic to handle deleting an account
    }

    public registerWebviewMessageHandler(webviewView: vscode.WebviewView, context: vscode.ExtensionContext): void {
        this.webviewView = webviewView;
        webviewView.webview.onDidReceiveMessage(
            message => {
                this.handleWebviewMessage(message);
            },
            undefined,
            context.subscriptions
        );
    }

    public dispose(): void {
        this.disposables.forEach(disposable => disposable.dispose());
    }
}