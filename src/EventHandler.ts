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
  private _currentRun;

  private async initializeWithStoredAccount(): Promise<void> {
    const selectedAccountId = this.accountManager.getSelectedAccount();
    if (selectedAccountId) {
      await this.initializeOpenAIClient(selectedAccountId);
    }
  }

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.accountManager = AccountManager.getInstance(context);
    vscode.window.onDidChangeActiveColorTheme(() => {
      if (this.webviewView) {
        this.updateWebviewTheme(this.webviewView);
      }
    });
  }

  private async getWorkspaceFiles(): Promise<string[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return [];

    const rootPath = workspaceFolders[0].uri.fsPath;
    const files: string[] = [];

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

    const processDirectory = async (dir: string) => {
      const entries = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(dir)
      );

      for (const [name, type] of entries) {
        const fullPath = path.join(dir, name);
        const relativePath = path.relative(rootPath, fullPath);

        if (ig.ignores(relativePath)) continue;

        if (type === vscode.FileType.Directory) {
          await processDirectory(fullPath);
        } else {
          files.push(relativePath);
        }
      }
    };

    await processDirectory(rootPath);
    return files;
  }

  // Add method to send files to webview
  private async sendWorkspaceFilesToWebview() {
    const files = await this.getWorkspaceFiles();
    this.sendMessageToWebview("updateWorkspaceFiles", { files });
  }

  private updateWebviewTheme(webviewView: vscode.WebviewView) {
    const isDark =
      vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
    webviewView.webview.postMessage({
      type: "theme-update",
      theme: isDark ? "dark" : "light",
    });
  }

  static getInstance(context: vscode.ExtensionContext): VSCodeEventHandler {
    if (!VSCodeEventHandler.instance) {
      VSCodeEventHandler.instance = new VSCodeEventHandler(context);
    }
    return VSCodeEventHandler.instance;
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
      case "newConversation":
        this.createNewConversation(
          message.payload.selectedAccount,
          message.payload.conversation
        );
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
        this.accountManager.setSelectedAccount(message.payload.accountId);
        await this.initializeOpenAIClient(message.payload.accountId);
        break;
      case "sendChatMessage":
        this.handleChatMessage(message.payload);
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
      case "removeExtensionData":
        console.log(`[EventHandler] Removing extension data`);
        this.accountManager.deleteAllAccounts();
        console.log(`[EventHandler] Extension data removed`);
      case "cancelRun":
        await this.cancelCurrentRun();
        break;
      case "getWorkspaceFiles":
        const files = await this.getWorkspaceFiles();
        this.sendMessageToWebview("updateWorkspaceFiles", { files });
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

  private async cancelCurrentRun() {
    if (this._currentRun && this.openaiClient) {
      console.log("Cancelling current run!");
      this._currentRun.controller.abort();
    }
  }

  private async handleChatMessage(payload: {
    accountId: string;
    conversationId: string;
    message: string;
    assistant: string;
    model: string;
    fileContexts: string[];
  }): Promise<void> {
    console.log(`[Chat] Starting chat message handler with payload:`, payload);
    if (!this.openaiClient) {
      console.log(`[Chat] Error: OpenAI client not initialized`);
      this.sendMessageToWebview("error", {
        message: "OpenAI client not initialized",
      });
      return;
    }

    console.log(`[Chat] File contexts:`, payload.fileContexts);

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

      // Handle thread creation or retrieval
      if (!conversation.threadId) {
        console.log(`[Chat] No existing thread, creating new one`);
        const thread = await this.openaiClient.beta.threads.create();
        conversation.threadId = thread.id;
        await this.updateConversation(payload.accountId, conversation);
      } else {
        console.log(`[Chat] Using existing thread: ${conversation.threadId}`);
        try {
          await this.openaiClient.beta.threads.retrieve(conversation.threadId);
        } catch (error) {
          console.log(`[Chat] Thread not found, creating new one`);
          const thread = await this.openaiClient.beta.threads.create();
          conversation.threadId = thread.id;
          await this.updateConversation(payload.accountId, conversation);
        }
      }

      console.log(
        `[Chat] Uploading ${payload.fileContexts.length} files to OpenAI`
      );
      const fileIds = await Promise.all([
        ...payload.fileContexts.map(async (filename) => {
          console.log(`[Chat] Uploading file: ${filename}`);
          if (filename === "Source Code") {
            const { relativePath } = await this.generateDocs();
            const markdownFileId = await this.uploadFileToOpenAI(relativePath);
            console.log(`[Chat] Source code uploaded successfully with ID: ${markdownFileId}`);
            return markdownFileId;
          } else {
            const fileId = await this.uploadFileToOpenAI(filename);
            console.log(`[Chat] File uploaded successfully with ID: ${fileId}`);
            return fileId;
          }
        }),
      ]);

      const hasAttachments = payload.fileContexts.length > 0;

      // Add message to thread
      await this.openaiClient.beta.threads.messages.create(
        conversation.threadId,
        {
          role: "user",
          content: hasAttachments
            ? "Search in the attached files! " + payload.message
            : payload.message,
          attachments: [
            ...fileIds.map((fileId) => ({
              file_id: fileId,
              tools: [{ type: "file_search" as const }],
            }))
          ],
        }
      );

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: "",
        sender: "assistant",
        timestamp: new Date().toISOString(),
      };
      conversation.messages = [...conversation.messages, assistantMessage];

      console.log(
        `[Chat] Starting thread run with assistant: ${payload.assistant}`
      );
      // Start streaming run
      const run = this.openaiClient.beta.threads.runs
        .stream(conversation.threadId, {
          assistant_id: payload.assistant,
          model: payload.model,
        })
        .on("textCreated", () => {
          this.sendMessageToWebview("updateTypingStatus", { isTyping: true });
        })
        .on("textDelta", (delta, snapshot) => {
          console.log(`[Chat] Received delta: ${delta.value}`);
          assistantMessage.content += delta.value;
          this.sendMessageToWebview("updateMessage", {
            messageId: assistantMessage.id,
            content: assistantMessage.content,
          });
        })
        .on("toolCallCreated", (toolCall) => {
          this.sendMessageToWebview("toolCall", { type: toolCall.type });
        })
        .on("toolCallDelta", (delta, snapshot) => {
          if (delta.type === "code_interpreter") {
            if (delta.code_interpreter.input) {
              assistantMessage.content += `\n\`\`\`\n${delta.code_interpreter.input}\n\`\`\`\n`;
            }
            if (delta.code_interpreter.outputs) {
              delta.code_interpreter.outputs.forEach((output) => {
                if (output.type === "logs") {
                  assistantMessage.content += `\nOutput:\n\`\`\`\n${output.logs}\n\`\`\`\n`;
                }
              });
            }
            this.sendMessageToWebview("updateMessage", {
              messageId: assistantMessage.id,
              content: assistantMessage.content,
            });
          }
        })
        .on("end", async () => {
          this.sendMessageToWebview("updateTypingStatus", { isTyping: false });
          await this.updateConversation(payload.accountId, conversation);
        });

      this._currentRun = run;
    } catch (error) {
      console.error("[Chat] Error processing chat message:", error);
      this.sendMessageToWebview("error", {
        message: "Failed to process chat message",
      });
      this.sendMessageToWebview("updateTypingStatus", { isTyping: false });
    }
  }

  private async generateDocs(): Promise<
    | {
        relativePath: string;
        path: string;
        filename: string;
        size: number;
        success: boolean;
      }
    | undefined
  > {
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

      console.log("[EventHandler] Getting file stats");
      const fileStats = await fsProm.stat(markdownUri.fsPath);
      console.log("[EventHandler] Sending success message to webview");
      return {
        relativePath: markdownUri.fsPath.replace(rootPath, ""),
        path: markdownUri.fsPath,
        filename: markdownFileName,
        size: fileStats.size,
        success: true,
      };
    } catch (error) {
      console.error("[EventHandler] Error generating documentation:", error);
      this.sendMessageToWebview("error", {
        message: "Error generating documentation: " + (error as Error).message,
      });
    }
  }

  private async uploadFileToOpenAI(filePath: string): Promise<string> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const rootPath = workspaceFolders[0].uri.fsPath;
    const absolutePath = vscode.Uri.file(path.join(rootPath, filePath));

    const fileContent = await vscode.workspace.fs.readFile(absolutePath);
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName).toLowerCase().slice(1);

    const allowedExtensions = [
      "c",
      "cpp",
      "css",
      "csv",
      "doc",
      "docx",
      "gif",
      "go",
      "html",
      "java",
      "jpeg",
      "jpg",
      "js",
      "json",
      "md",
      "pdf",
      "php",
      "pkl",
      "png",
      "pptx",
      "py",
      "rb",
      "tar",
      "tex",
      "ts",
      "txt",
      "webp",
      "xlsx",
      "xml",
      "zip",
    ];

    const finalFileName = allowedExtensions.includes(fileExt)
      ? fileName
      : `${fileName}.txt`;

    const blob = new Blob([fileContent], { type: "text/plain" });
    const file = new File([blob], finalFileName);

    const uploadedFile = await this.openaiClient.files.create({
      file,
      purpose: "assistants",
    });

    return uploadedFile.id;
  }
  private async generateMarkdownContent(rootPath: string): Promise<string> {
    // Enhanced Introduction and Table of Contents
    let markdown = `# Project Source Code Documentation

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
        if (ig.ignores(relativePath)) {
          continue;
        }

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
        if (ig.ignores(relativePath)) {
          continue;
        }

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
        threadId: null,
      };
    }

    // Verify thread exists if we have one
    if (conversation.threadId && this.openaiClient) {
      try {
        await this.openaiClient.beta.threads.retrieve(conversation.threadId);
      } catch (error) {
        console.log(
          `[Chat] Thread ${conversation.threadId} not found, creating new thread`
        );
        const newThread = await this.openaiClient.beta.threads.create();
        conversation.threadId = newThread.id;
        await this.updateConversation(accountId, conversation);
      }
    }

    return conversation;
  }

  private async updateConversation(
    accountId: string,
    conversation: Conversation
  ): Promise<void> {
    // Use Map for O(1) lookup instead of find
    const accountsMap = new Map(
      this.accountManager.getAccounts().map((acc) => [acc.id, acc])
    );
    const account = accountsMap.get(accountId);

    if (account) {
      // Update conversations efficiently using Map
      const conversationsMap = new Map(
        account.conversations.map((conv) => [conv.id, conv])
      );
      conversationsMap.set(conversation.id, conversation);

      account.conversations = Array.from(conversationsMap.values());
      await this.accountManager.storeAccount(account);

      // Batch update notifications
      this.sendMessageToWebview("updateConversation", {
        conversation,
        accountId,
      });
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
    const selectedAccountId = this.accountManager.getSelectedAccount();
    this.initializeWithStoredAccount();
    console.log(`[Account Handler] Getting accounts:`, accounts);
    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: "updateAccounts",
        accounts: accounts,
        selectedAccountId: selectedAccountId,
      });
    }
  }

  private createNewConversation(selectedAccount: any, conversation: any): void {
    console.log(
      `[Conversation Handler] Creating new conversation:`,
      selectedAccount,
      conversation
    );
    if (selectedAccount) {
      selectedAccount.conversations = selectedAccount.conversations || [];
      selectedAccount.conversations.push(conversation);
      this.accountManager.storeAccount(selectedAccount);
    }
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

}
