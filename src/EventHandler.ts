import * as vscode from "vscode";
import { AccountManager } from "./AccountManager";
import OpenAI from "openai";
import { Conversation, Message } from "@/types";
import * as fsProm from "fs/promises";
import * as fs from "fs";
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
        this.handleUpload(message.payload.accountId);
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
        content: `You are a helpful assistant. 
        Search for information in the stored files as embeddings in the vector store.. 
        Project Documentation contains the source code of the software project, and reference specific sections when possible. 
        Follow the instructions of the assistant and use these ones as aggregates. Answer in the language of the user.`,
      };
      
      const threadMessages = [
        systemMessage,
        ...conversation.messages.map((msg) => ({
          role: msg.sender as "user" | "assistant",
          content: msg.content,
        }))
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
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders) {
      this.sendMessageToWebview("error", {
        message: "No workspace folder open",
      });
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const sherpaDir = path.join(rootPath, ".sherpa-files");
    const outputFileName = path.join(sherpaDir, "project-documentation.md");

    try {
      // Create .sherpa-files directory
      await vscode.workspace.fs.createDirectory(vscode.Uri.file(sherpaDir));

      // Read .gitignore if exists
      let gitignore = "";
      try {
        gitignore = await fsProm.readFile(
          path.join(rootPath, ".gitignore"),
          "utf8"
        );
      } catch (e) {
        gitignore = "";
      }

      const ig = ignore()
        .add(gitignore)
        .add([
          ".sherpa-files",
          "package-lock.json",
          "yarn.lock",
          ".git",
          "node_modules",
        ]);

      let markdown = "# Project Documentation\n\n## Directory Structure\n\n";

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
        const content = await vscode.workspace.fs.readFile(
          vscode.Uri.file(filePath)
        );
        const extension = path.extname(filePath).slice(1);
        const relativePath = path.relative(rootPath, filePath);
        markdown += `### ${relativePath}\n\n\`\`\`${extension}\n${content.toString()}\n\`\`\`\n\n`;
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
      const fileContent = Buffer.from(markdown);
      const outputFileUri = vscode.Uri.file(outputFileName);
      await vscode.workspace.fs.writeFile(outputFileUri, fileContent);

      // Store the generated file path and URI
      this._generatedDocPath = outputFileUri.fsPath;

      this.sendMessageToWebview("docsGenerated", {
        path: sherpaDir,
        filename: "project-documentation.md",
        size: fileContent.length,
        success: true,
      });
    } catch (error) {
      console.error("[EventHandler] Error generating documentation:", error);
      this.sendMessageToWebview("error", {
        message: "Error generating documentation: " + (error as Error).message,
      });
    }
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

    await this.uploadFileToVectorStore(this._generatedDocPath);
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

  private async uploadFileToVectorStore(filePath: string): Promise<void> {
    if (!this.openaiClient || !this._currentAssistant) {
      console.log("[EventHandler] OpenAI client or assistant not initialized");
      this.sendMessageToWebview("error", {
        message: "Please select an assistant and ensure your API key is set",
      });
      return;
    }

    this.sendMessageToWebview("uploadStart", {});

    try {
      // Verify file exists and get stats
      const stats = await fsProm.stat(filePath);

      console.log(`[EventHandler] File found: $src/EventHandler.ts`);
      console.log(`[EventHandler] File size: ${stats.size} bytes`);

      // Read file content
      const fileContent = await fsProm.readFile(filePath);
      const fileName = path.basename(filePath);

      this.sendMessageToWebview("uploadStart", {});
      console.log(`[EventHandler] Preparing to upload file: ${fileName}`);

      // Create a Blob from the file content
      const blob = new Blob([fileContent], { type: "text/markdown" });
      const file = new File([blob], fileName, { type: "text/markdown" });

      // Get current assistant configuration
      const assistant = await this.openaiClient.beta.assistants.retrieve(
        this._currentAssistant
      );
      let vectorStoreId;
      let vectorStoreName;

      // Check if assistant has a vector store
      if (assistant.tool_resources?.file_search?.vector_store_ids?.length > 0) {
        vectorStoreId =
          assistant.tool_resources.file_search.vector_store_ids[0];
        const vectorStore = await this.openaiClient.beta.vectorStores.retrieve(
          vectorStoreId
        );
        vectorStoreName = vectorStore.name;
        console.log(
          `[EventHandler] Using existing vector store: ${vectorStoreName} (${vectorStoreId})`
        );

        // Get existing files in the vector store
        const files = await this.openaiClient.beta.vectorStores.files.list(
          vectorStoreId
        );
        // Find and delete file with the same name if it exists
        const existingFile = await Promise.all(
          files.data.map(async (f) => {
            const fileDetails = await this.openaiClient.files.retrieve(f.id);
            return fileDetails.filename === fileName ? f : null;
          })
        ).then((results) => results.find((f) => f !== null));
        if (existingFile) {
          console.log(
            `[EventHandler] Deleting existing file with same name: ${fileName}`
          );
          await this.openaiClient.beta.vectorStores.files.del(
            vectorStoreId,
            existingFile.id
          );
        }
      } else {
        vectorStoreName = `Sherpa Store - ${assistant.name}`;
        const vectorStore = await this.openaiClient.beta.vectorStores.create({
          name: vectorStoreName,
        });
        vectorStoreId = vectorStore.id;
        console.log(
          `[EventHandler] Created new vector store: ${vectorStoreName} (${vectorStoreId})`
        );
      }

      // Upload file to vector store
      await this.openaiClient.beta.vectorStores.fileBatches.uploadAndPoll(
        vectorStoreId,
        { files: [file] }
      );
      console.log(`[EventHandler] File uploaded to vector store successfully`);

      // Ensure assistant has file_search tool and vector store
      await this.openaiClient.beta.assistants.update(this._currentAssistant, {
        tools: [{ type: "file_search" }],
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStoreId],
          },
        },
      });

      console.log(
        `[EventHandler] Assistant updated with vector store configuration`
      );

      this.sendMessageToWebview("uploadComplete", {
        fileName,
        vectorStoreName,
        vectorStoreId,
        assistantName: assistant.name,
      });
    } catch (error) {
      console.error(
        "[EventHandler] Error uploading file to vector store:",
        error
      );
      this.sendMessageToWebview("error", {
        message:
          "Error uploading file to vector store: " + (error as Error).message,
      });
    }
  }
}
