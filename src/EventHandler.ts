import * as vscode from "vscode";
import { AccountManager } from "./AccountManager";
import OpenAI from "openai";
import { Conversation, Message } from "@/types";
import * as fsProm from "fs/promises";
import { isBinaryFile } from "isbinaryfile";
import * as path from "path";
import ignore from "ignore";

export class VSCodeEventHandler {
  private static instance: VSCodeEventHandler;
  private accountManager: AccountManager;
  private disposables: vscode.Disposable[] = [];
  private webviewView: vscode.WebviewView | undefined;
  private context: vscode.ExtensionContext;
  private openaiClient: OpenAI | null = null;
  private _currentAssistant: string | undefined;
  private _currentModel: string | undefined;
  private _generatedDocPath: string | undefined;
  private _uploadedFileId: string | undefined;

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
  public async handleWebviewMessage(message: {
    type: string;
    payload: any;
  }): Promise<void> {
    // Log the incoming message with type and payload
    console.log(`[Sherpa Coder Webview Message] Received message:`, {
      type: message.type,
      payload: message.payload,
    });

    switch (message.type) {
      case "upload":
        this.handleUpload();
        break;
      case "newConversation":
        this.createNewConversation(message.payload.conversation);
        break;
      case "createAccount":
        this.createAccount(message.payload.account);
        break;
      case "deleteAccount":
        this.deleteAccount(message.payload.accountId);
        break;
      case "deleteConversation":
        this.deleteConversation(
          message.payload.accountId,
          message.payload.conversationId
        );
        break;
      case "getAccounts":
        this.getAccounts();
        break;
      case "getApiKey":
        await this.initializeOpenAIClient(message.payload.accountId);
        break;
      case "selectAccount":
        await this.initializeOpenAIClient(message.payload.accountId);
        break;
      case "sendChatMessage":
        this.handleChatMessage(message.payload);
        break;
      case "generateDocs":
        this.generateDocs(message.payload);
        break;
      case "updateAssistant":
        this._currentAssistant = message.payload.assistantId;
        console.log(
          `[EventHandler] Updated current assistant: ${this._currentAssistant}`
        );
        break;
      case "updateModel":
        this._currentModel = message.payload.modelId;
        console.log(
          `[EventHandler] Updated current model: ${this._currentModel}`
        );
        break;
      default:
        console.log(`Unhandled message type: ${message.type}`, message.payload);
    }
  }

  // Getters for the states
  public getCurrentAssistant(): string | undefined {
    return this._currentAssistant;
  }

  public getCurrentModel(): string | undefined {
    return this._currentModel;
  }

  private async initializeOpenAIClient(accountId: string): Promise<void> {
    console.log(
      `[OpenAI Client] Initializing client for account ID: ${accountId}`
    );
    const apiKey = await this.accountManager.getApiKey(accountId);
    if (!apiKey) {
      console.log(
        `[OpenAI Client] No API key found for account ID: ${accountId}`
      );
      this.sendMessageToWebview("error", {
        message: "API key not found for the selected account.",
      });
      return;
    }

    try {
      console.log(`[OpenAI Client] Creating new OpenAI client instance`);
      this.openaiClient = new OpenAI({ apiKey });

      console.log(`[OpenAI Client] Fetching assistants list`);
      const assistantsResponse = await this.openaiClient.beta.assistants.list();
      console.log(
        `[OpenAI Client] Retrieved ${assistantsResponse.data.length} assistants`
      );

      console.log(`[OpenAI Client] Fetching models list`);
      const modelsResponse = await this.openaiClient.models.list();
      const gptModels = modelsResponse.data.filter((model) =>
        model.id.startsWith("gpt-")
      );
      console.log(`[OpenAI Client] Found ${gptModels.length} GPT models`);

      console.log(`[OpenAI Client] Sending lists to webview`);
      if (this.webviewView) {
        this.webviewView.webview.postMessage({
          command: "updateLists",
          assistants: assistantsResponse.data,
          models: gptModels,
        });
      }
    } catch (error) {
      console.error(
        "[OpenAI Client] Failed to initialize OpenAI client:",
        error
      );
      this.sendMessageToWebview("error", {
        message:
          "Failed to initialize OpenAI client. Check the API key and try again.",
      });
    }
  }

  private async handleChatMessage(payload: {
    accountId: string;
    conversationId: number;
    message: string;
    assistant: string;
    model: string;
    attachDoc: boolean;
  }): Promise<void> {
    console.log(`[Chat] Starting chat message handler with payload:`, payload);
    if (!this.openaiClient) {
      console.log(`[Chat] Error: OpenAI client not initialized`);
      this.sendMessageToWebview("error", {
        message: "OpenAI client not initialized",
      });
      return;
    }

    try {
      console.log(
        `[Chat] Getting conversation for ID: ${payload.conversationId}`
      );
      let conversation = await this.getConversation(
        payload.accountId,
        payload.conversationId
      );

      console.log(`[Chat] Creating user message`);
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content: payload.message,
        sender: "user",
        timestamp: new Date().toISOString(),
      };
      conversation.messages = [...conversation.messages, userMessage];
      conversation.lastMessage = userMessage.content;

      console.log(`[Chat] Sending typing indicator and conversation update`);
      this.sendMessageToWebview("updateTypingStatus", { isTyping: true });
      this.sendMessageToWebview("updateConversation", { conversation });

      console.log(`[Chat] Creating new thread with previous messages`);
      const systemMessage = {
        role: "user",
        content: "Consult the attached file 'project-documentation.txt' for the source code"};

      console.log(`[Chat] Preparing thread messages with ${conversation.messages.length} previous messages`);
      const threadMessages = [
        systemMessage,
        ...conversation.messages.map((msg) => {
          const hasAttachment = payload.attachDoc && this._generatedDocPath;
          console.log(`[Chat] Adding message from ${msg.sender}${hasAttachment ? ' with document attachment' : ''}`);
          return {
            role: msg.sender as "user" | "assistant",
            content: msg.content,
            ...(payload.attachDoc && this._generatedDocPath && {
              attachments: [{ file_id: this._uploadedFileId, tools: [{ type: "file_search" }] }],
            })
          };
        }),
      ];

      const thread = await this.openaiClient.beta.threads.create({
        messages: threadMessages,
      });

      console.log(`[Chat] Created thread with ID: ${thread.id}`);

      console.log(
        `[Chat] Starting thread run with assistant: ${payload.assistant}`
      );
      const run = await this.openaiClient.beta.threads.runs.create(thread.id, {
        assistant_id: payload.assistant,
        model: payload.model,
      });

      console.log(`[Chat] Waiting for run completion. Run ID: ${run.id}`);
      let response = await this.openaiClient.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
      while (
        response.status === "in_progress" ||
        response.status === "queued"
      ) {
        console.log(`[Chat] Run status: ${response.status}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        response = await this.openaiClient.beta.threads.runs.retrieve(
          thread.id,
          run.id
        );
      }
      console.log(`[Chat] Run completed with status: ${response.status}`);

      console.log(`[Chat] Retrieving thread messages`);
      const messages = await this.openaiClient.beta.threads.messages.list(
        thread.id
      );

      console.log(`[Chat] Creating assistant message`);
      const assistantMessage: Message = {
        id: messages.data[0].id,
        content: messages.data[0].content[0].text.value,
        sender: "assistant",
        timestamp: new Date().toISOString(),
      };

      conversation.messages = [...conversation.messages, assistantMessage];
      conversation.lastMessage = assistantMessage.content;

      console.log(`[Chat] Updating conversation in storage`);
      await this.updateConversation(payload.accountId, conversation);

      console.log(`[Chat] Sending final updates to webview`);
      this.sendMessageToWebview("updateTypingStatus", { isTyping: false });
      this.sendMessageToWebview("updateConversation", { conversation });
    } catch (error) {
      console.error("[Chat] Error processing chat message:", error);
      this.sendMessageToWebview("error", {
        message: "Failed to process chat message",
      });
      this.sendMessageToWebview("updateTypingStatus", { isTyping: false });
    }
  }

  private async generateDocs(payload: {
    accountId: string;
    assistantId: string;
    modelId: string;
  }): Promise<void> {
    console.log("[EventHandler] Starting documentation generation");
    console.log("[EventHandler] Checking workspace folders");
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders) {
      console.log("[EventHandler] No workspace folders found");
      this.sendMessageToWebview("error", {
        message: "No workspace folder open",
      });
      return;
    }

    console.log("[EventHandler] Setting up file paths");
    const rootPath = workspaceFolders[0].uri.fsPath;
    const sherpaDir = path.join(rootPath, ".sherpa-files");
    const markdownFileName = "project-documentation.txt";
    const markdownUri = vscode.Uri.file(path.join(sherpaDir, markdownFileName));

    try {
      console.log("[EventHandler] Creating .sherpa-files directory");
      await vscode.workspace.fs.createDirectory(vscode.Uri.file(sherpaDir));

      console.log("[EventHandler] Generating markdown content");
      const markdown = await this.generateMarkdownContent(rootPath);

      console.log("[EventHandler] Writing markdown file");
      const markdownContent = Buffer.from(markdown);
      await vscode.workspace.fs.writeFile(markdownUri, markdownContent);
      
      console.log("[EventHandler] Storing generated Markdown path");
      this._generatedDocPath = markdownUri.fsPath;

      console.log("[EventHandler] Getting PDF stats");
      const pdfStats = await fsProm.stat(markdownUri.fsPath);
      console.log("[EventHandler] Sending success message to webview");
      this.sendMessageToWebview("docsGenerated", {
        path: sherpaDir,
        filename: markdownFileName,
        size: pdfStats.size,
        success: true,
      });
    } catch (error) {
      console.error("[EventHandler] Error generating documentation:", error);
      this.sendMessageToWebview("error", {
        message: "Error generating documentation: " + (error as Error).message,
      });
    }
  }

  private async generateMarkdownContent(rootPath: string): Promise<string> {
    // Enhanced Introduction and Table of Contents
    let markdown =
      `# Project Source Code Documentation

## Introduction

This document is the definitive guide and primary source for understanding the project’s source code and architecture. It contains comprehensive information about the code base, including directory structures, detailed code examples, and implementation notes. Use this document as the primary reference for any queries related to the project's code, software behaviors, and overall design.

## Table of Contents
1. Introduction
2. Directory Structure
3. Source Code

## Directory Structure

Below is the directory structure of the project source code. Each file section that follows contains the full file path and its complete source code.

`;

    const ig = ignore().add([
      ".sherpa-files",
      "package-lock.json",
      "yarn.lock",
      ".git",
      "node_modules",
      "*.png",
      "*.jpg",
      "*.jpeg",
      "*.gif",
      "*.pdf",
      "*.exe",
      "*.dll",
      "*.bin",
      "*.zip",
      "*.tar",
      "*.gz",
    ]);

    const getFiles = async (dir: string, prefix = ""): Promise<string> => {
      let content = "";
      const entries = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(dir)
      );

      for (const [name, type] of entries) {
        const relativePath = path.relative(rootPath, path.join(dir, name));
        if (ig.ignores(relativePath)) continue;

        const fullPath = path.join(dir, name);
        if (type === vscode.FileType.Directory) {
          content += `${prefix}📁 ${name}/\n`;
          content += await getFiles(fullPath, `${prefix}  `);
        } else {
          content += `${prefix}📄 ${name}\n`;
        }
      }
      return content;
    };

    markdown += await getFiles(rootPath);
    markdown += "\n## Source Code\n\n";

    const processFile = async (filePath: string): Promise<void> => {
      const fileContent = await vscode.workspace.fs.readFile(
        vscode.Uri.file(filePath)
      );
      const isBinary = await isBinaryFile(
        Buffer.from(fileContent),
        fileContent.byteLength
      );
      if (isBinary) {
        return;
      }
      const content = await vscode.workspace.fs.readFile(
        vscode.Uri.file(filePath)
      );
      const extension = path.extname(filePath).slice(1);
      const relativePath = path.relative(rootPath, filePath);

      // Include detailed code description
      markdown += `### Source Code: ${path.basename(filePath)}

#### File Details
- **Type**: ${extension}
- **Relative Path**: ${relativePath}

\`\`\`${extension}
${content.toString()}
\`\`\`

`;
    };
    
    const processDirectory = async (dir: string): Promise<void> => {
      const entries = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(dir)
      );
      for (const [name, type] of entries) {
        const relativePath = path.relative(rootPath, path.join(dir, name));
        if (ig.ignores(relativePath)) continue;

        const fullPath = path.join(dir, name);
        if (type === vscode.FileType.Directory) {
          await processDirectory(fullPath);
        } else {
          await processFile(fullPath);
        }
      }
    };

    await processDirectory(rootPath);
    return markdown;
}

  private async getConversation(
    accountId: string,
    conversationId: string
  ): Promise<Conversation> {
    const accounts = this.accountManager.getAccounts();
    const account = accounts.find((acc) => acc.id === accountId);
    let conversation = account?.conversations?.find(
      (conv) => conv.id === conversationId
    );

    if (!conversation) {
      conversation = {
        id: conversationId,
        title: `Conversation ${conversationId}`,
        date: new Date().toISOString().split("T")[0],
        messages: [],
        lastMessage: "",
      };
    }

    return conversation;
  }

  private async updateConversation(
    accountId: string,
    conversation: Conversation
  ): Promise<void> {
    console.log(
      `[Conversation Handler] Updating conversation for account ID: ${accountId}`,
      conversation
    );
    const accounts = this.accountManager.getAccounts();
    const accountIndex = accounts.findIndex((acc) => acc.id === accountId);

    if (accountIndex !== -1) {
      console.log(
        `[Conversation Handler] Found account at index: ${accountIndex}`
      );
      const conversationIndex = accounts[accountIndex].conversations.findIndex(
        (conv) => conv.id === conversation.id
      );

      if (conversationIndex !== -1) {
        console.log(
          `[Conversation Handler] Updating existing conversation at index: ${conversationIndex}`
        );
        accounts[accountIndex].conversations[conversationIndex] = conversation;
      } else {
        console.log(
          `[Conversation Handler] Adding new conversation to account`
        );
        accounts[accountIndex].conversations.push(conversation);
      }

      console.log(`[Conversation Handler] Storing updated account`);
      await this.accountManager.storeAccount(accounts[accountIndex]);
    } else {
      console.log(
        `[Conversation Handler] Account not found with ID: ${accountId}`
      );
    }
  }

  private async deleteConversation(
    accountId: string,
    conversationId: string
  ): Promise<void> {
    console.log(
      `[Conversation Handler] Deleting conversation ${conversationId} for account ID: ${accountId}`
    );
    const accounts = this.accountManager.getAccounts();
    const accountIndex = accounts.findIndex((acc) => acc.id === accountId);

    if (accountIndex !== -1) {
      const account = accounts[accountIndex];
      account.conversations = account.conversations.filter(
        (conv) => conv.id !== conversationId
      );
      await this.accountManager.storeAccount(account);

      this.sendMessageToWebview("conversationDeleted", {
        accountId,
        conversationId,
      });
    } else {
      console.log(
        `[Conversation Handler] Account not found with ID: ${accountId}`
      );
    }
  }

  private sendMessageToWebview(command: string, payload: any): void {
    console.log(`[Webview Message] Sending message:`, { command, payload });
    if (this.webviewView) {
      this.webviewView.webview.postMessage({ command, ...payload });
    }
  }

  private async getAccounts(): Promise<void> {
    const accounts = this.accountManager.getAccounts();
    console.log(`[Account Handler] Getting accounts:`, accounts);
    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: "updateAccounts",
        accounts: accounts,
      });
    }
  }

  private async handleUpload(): Promise<void> {
    if (!this._generatedDocPath) {
      this.sendMessageToWebview("error", {
        message: "No documentation file generated yet",
      });
      return;
    }

    await this.uploadFileOpenAI(this._generatedDocPath);
  }

  private createNewConversation(conversation: any): void {
    console.log(
      `[Conversation Handler] Creating new conversation:`,
      conversation
    );
    // Implement the logic to handle creating a new conversation
  }

  private async createAccount(account: any): Promise<void> {
    console.log(`[Account Handler] Creating new account:`, account);
    try {
      await this.accountManager.storeAccount(account);
    } catch (error) {
      console.error(`[Account Handler] Error creating account:`, error);
    } // Implement the logic to handle creating a new account
  }

  private async deleteAccount(accountId: string): Promise<void> {
    console.log(`[Account Handler] Deleting account with ID: ${accountId}`);
    await this.accountManager.deleteAccount(accountId);
    // Implement the logic to handle deleting an account
  }

  public registerWebviewMessageHandler(
    webviewView: vscode.WebviewView,
    context: vscode.ExtensionContext
  ): void {
    this.webviewView = webviewView;
    webviewView.webview.onDidReceiveMessage(
      (message) => {
        this.handleWebviewMessage(message);
      },
      undefined,
      context.subscriptions
    );
  }

  public dispose(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
  }

  private async uploadFileOpenAI(filePath: string): Promise<void> {
    if (!this.openaiClient) {
        console.log("[EventHandler] OpenAI client not initialized");
        this.sendMessageToWebview("error", {
            message: "Please ensure your API key is set"
        });
        return;
    }

    this.sendMessageToWebview("uploadStart", {});

    try {
        const stats = await fsProm.stat(filePath);
        console.log(`[EventHandler] File found: ${filePath}`);
        console.log(`[EventHandler] File size: ${stats.size} bytes`);

        const fileContent = await fsProm.readFile(filePath);
        const fileName = path.basename(filePath);

        const blob = new Blob([fileContent], { type: "text/markdown" });
        const file = new File([blob], fileName, { type: "text/markdown" });

        const uploadedFile = await this.openaiClient.files.create({
            file,
            purpose: "assistants"
        });

        this._uploadedFileId = uploadedFile.id;

        console.log(`[EventHandler] File uploaded successfully with ID: ${uploadedFile.id}`);

        this.sendMessageToWebview("uploadComplete", {
            fileName,
            fileId: uploadedFile.id,
            success: true
        });

    } catch (error) {
        console.error("[EventHandler] Error uploading file:", error);
        this.sendMessageToWebview("error", {
            message: "Error uploading file: " + (error as Error).message
        });
    }
}
  
}
