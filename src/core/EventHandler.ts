import * as vscode from "vscode";
import { AccountManager } from "./AccountManager";
import OpenAI from "openai";
import * as fsProm from "fs/promises";
import { isBinaryFile } from "isbinaryfile";
import * as path from "path";
import ignore from "ignore";
import { Conversation, Message } from "src/types";
import log from "@/utils/logger";

export class VSCodeEventHandler {
  private static instance: VSCodeEventHandler;
  private accountManager: AccountManager;
  private disposables: vscode.Disposable[] = [];
  private webviewView: vscode.WebviewView | undefined;
  private openaiClient: OpenAI | null = null;
  private _currentAssistant: string | undefined;
  private _currentModel: string | undefined;
  private _currentRun: { controller: AbortController } | undefined;

  private async initializeWithStoredAccount(): Promise<void> {
    const selectedAccountId = this.accountManager.getSelectedAccount();
  }

  private constructor(context: vscode.ExtensionContext) {
    this.accountManager = AccountManager.getInstance(context);
    vscode.window.onDidChangeActiveColorTheme(() => {
      if (this.webviewView) {
        this.updateWebviewTheme(this.webviewView);
      }
    });
  }

  private async getWorkspaceFiles(): Promise<string[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return [];
    }

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

        if (ig.ignores(relativePath)) {
          continue;
        }

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
    log.info(`[Sherpa Coder Webview Message] Received message:`, {
      type: message.type,
      payload: message.payload,
    });

    switch (message.type) {
      case "showToast":
        if (message.payload.toastType === "success") {
          this.showSuccessMessage(message.payload.message);
        } else if (message.payload.toastType === "warning") {
          this.showWarningMessage(message.payload.message);
        } else if (message.payload.toastType === "error") {
          this.showErrorMessage(message.payload.message);
        } else {
          console.warn("Invalid toast message type received", message.payload.type);
        }
        break;
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
      case "openFile":
        const filePath = vscode.Uri.file(
          vscode.workspace.workspaceFolders?.[0]?.uri.fsPath +
          "/" +
          message.payload.filePath
        );
        vscode.workspace.openTextDocument(filePath).then((doc) => {
          vscode.window.showTextDocument(doc);
        });
        break;
      case "selectAccount":
        this.accountManager.setSelectedAccount(message.payload.accountId);
        await this.initializeOpenAIClient(message.payload.accountId);
        break;
      case "refreshModelsAndAssistants":
        this.refreshModelsAndAssistants();
        break;
      case "sendChatMessage":
        this.handleChatMessage(message.payload);
        break;
      case "updateAssistant":
        this._currentAssistant = message.payload.assistantId;
        log.info(
          `[EventHandler] Updated current assistant: ${this._currentAssistant}`
        );
        break;
      case "updateModel":
        this._currentModel = message.payload.modelId;
        log.info(`[EventHandler] Updated current model: ${this._currentModel}`);
        break;
      case "removeExtensionData":
        log.info(`[EventHandler] Removing extension data`);
        this.accountManager.deleteAllAccounts();
        log.info(`[EventHandler] Extension data removed`);
      case "cancelRun":
        await this.cancelCurrentRun();
        break;
      case "getWorkspaceFiles":
        const files = await this.getWorkspaceFiles();
        this.sendMessageToWebview("updateWorkspaceFiles", { files });
        break;
      case "initClient":
        this.initClient();
        break;
      default:
        log.info(`Unhandled message type: ${message.type}`, message.payload);
    }
  }

  async refreshModelsAndAssistants() {
    try {
      if (!this.openaiClient) {
        log.info("[EventHandler] OpenAI client not initialized");
        return;
      }

      log.info(`[OpenAI Client] Fetching assistants list`);
      const assistantsResponse = await this.openaiClient.beta.assistants.list();
      log.info(
        `[OpenAI Client] Retrieved ${assistantsResponse.data.length} assistants`
      );
      assistants = assistantsResponse.data;

      let gptModels;

      log.info(`[OpenAI Client] Fetching models list`);
      const modelsResponse = await this.openaiClient.models.list();
      gptModels = modelsResponse.data.filter((model) =>
        model.id.startsWith("gpt-")
      );
      log.info(`[OpenAI Client] Found ${gptModels.length} GPT models`);

      throw new Error("Bang!");

      log.info(`[OpenAI Client] Sending lists to webview`);
      if (this.webviewView) {
        this.webviewView.webview.postMessage({
          command: "updateLists",
          assistants: assistants,
          models: gptModels,
        });
      }

      log.info(
        `[EventHandler] Retrieved ${gptModels.length} models and ${assistants.length} assistants`
      );
    } catch (error) {
      log.error(
        "[EventHandler] Error refreshing models and assistants:",
        error
      );
      this.sendMessageToWebview("refresh-Error", {
        message: "Failed to refresh models and assistants",
      });
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
    log.info(
      `[OpenAI Client] Initializing client for account ID: ${accountId}`
    );
    this.sendMessageToWebview("openAIClient-Connecting", {});
    const apiKey = await this.accountManager.getApiKey(accountId);
    if (!apiKey) {
      log.info(`[OpenAI Client] No API key found for account ID: ${accountId}`);
      this.sendMessageToWebview("openAIClient-Error", {});
      return;
    }

    try {
      log.info(`[OpenAI Client] Creating new OpenAI client instance`);
      this.openaiClient = new OpenAI({ apiKey });
      await this.openaiClient.models.retrieve("gpt-4");
      this.sendMessageToWebview("openAIClient-Connected", {});
    } catch (error) {
      log.error("[OpenAI Client] Failed to create OpenAI client:", error);
      this.sendMessageToWebview("openAIClient-Error", {
        message:
          "Failed to create OpenAI client. Check the API key and try again.",
      });
      return;
    }

    let assistants;

    try {
      log.info(`[OpenAI Client] Fetching assistants list`);
      const assistantsResponse = await this.openaiClient.beta.assistants.list();
      log.info(
        `[OpenAI Client] Retrieved ${assistantsResponse.data.length} assistants`
      );
      assistants = assistantsResponse.data;
      this.sendMessageToWebview("assistants-Retrieved", {
        count: assistantsResponse.data.length,
      });
    } catch (error) {
      log.error("[OpenAI Client] Failed to fetch assistants:", error);
      this.sendMessageToWebview("openAIClient-Error", {
        message: "Failed to fetch assistants list.",
      });
      return;
    }

    let gptModels;
    try {
      log.info(`[OpenAI Client] Fetching models list`);
      const modelsResponse = await this.openaiClient.models.list();
      gptModels = modelsResponse.data.filter((model) =>
        model.id.startsWith("gpt-")
      );
      log.info(`[OpenAI Client] Found ${gptModels.length} GPT models`);
      this.sendMessageToWebview("models-Retrieved", {
        count: gptModels.length,
      });
    } catch (error) {
      log.error("[OpenAI Client] Failed to fetch models:", error);
      this.sendMessageToWebview("openAIClient-Error", {
        message: "Failed to fetch models list.",
      });
      return;
    }

    this.sendMessageToWebview("openAIClient-Done", {});

    log.info(`[OpenAI Client] Sending lists to webview`);
    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: "updateLists",
        assistants: assistants,
        models: gptModels,
      });
    }
  }

  private async cancelCurrentRun() {
    if (this._currentRun && this.openaiClient) {
      log.info("Cancelling current run!");
      this._currentRun.controller.abort();
    }
  }

  private showSuccessMessage(message: string) {
    vscode.window.showInformationMessage(message);
  }

  private showErrorMessage(message: string) {
    vscode.window.showErrorMessage(message);
  }

  private showWarningMessage(message: string) {
    vscode.window.showWarningMessage(message);
  }

  private async handleChatMessage(payload: {
    accountId: string;
    conversationId: string;
    message: string;
    assistant: {
      id: string;
      name: string;
    };
    model: {
      id: string;
      name: string;
    };
    fileContexts: string[];
  }): Promise<void> {
    log.info(`[Chat] Starting chat message handler with payload:`, payload);
    if (!this.openaiClient) {
      log.info(`[Chat] Error: OpenAI client not initialized`);
      this.sendMessageToWebview("error", {
        message: "OpenAI client not initialized",
      });
      return;
    }

    log.info(`[Chat] File contexts:`, payload.fileContexts);

    let conversation = await this.getConversation(
      payload.accountId,
      payload.conversationId
    );

    try {
      log.info(`[Chat] Getting conversation for ID: ${payload.conversationId}`);

      log.info(`[Chat] Creating user message`);
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content: payload.message,
        sender: "user",
        timestamp: new Date().toISOString(),
        modelName: payload.model.name,
        assistantName: payload.assistant.name,
        attachments: payload.fileContexts.map((filePath) => ({
          url: "",
          path: filePath,
          fileName: filePath.split("/").pop() || filePath,
        })),
      };
      conversation.messages = [...conversation.messages, userMessage];
      conversation.lastMessage = userMessage.content;

      log.info(`[Chat] Sending typing indicator and conversation update`);
      this.sendMessageToWebview("updateTypingStatus", { isTyping: true });
      this.sendMessageToWebview("updateConversation", { conversation });

      // Handle thread creation or retrieval
      if (!conversation.threadId) {
        log.info(`[Chat] No existing thread, creating new one`);
        const thread = await this.openaiClient.beta.threads.create();
        conversation.threadId = thread.id;
        await this.updateConversation(payload.accountId, conversation);
      } else {
        log.info(`[Chat] Using existing thread: ${conversation.threadId}`);
        try {
          await this.openaiClient.beta.threads.retrieve(conversation.threadId);
        } catch (error) {
          log.info(`[Chat] Thread not found, creating new one`);
          const thread = await this.openaiClient.beta.threads.create();
          conversation.threadId = thread.id;
          await this.updateConversation(payload.accountId, conversation);
        }
      }

      log.info(
        `[Chat] Uploading ${payload.fileContexts.length} files to OpenAI`
      );
      const fileIds = await Promise.all([
        ...payload.fileContexts.map(async (filename) => {
          log.info(`[Chat] Uploading file: ${filename}`);
          if (filename === "Source Code") {
            const { relativePath } = await this.generateDocs();
            const markdownFileId = await this.uploadFileToOpenAI(relativePath);
            log.info(
              `[Chat] Source code uploaded successfully with ID: ${markdownFileId}`
            );
            return markdownFileId;
          } else {
            const fileId = await this.uploadFileToOpenAI(filename);
            log.info(`[Chat] File uploaded successfully with ID: ${fileId}`);
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
            })),
          ],
        }
      );

      // Create assistant message placeholder after successful run start
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: "",
        sender: "assistant",
        timestamp: new Date().toISOString(),
        modelName: payload.model.name,
        assistantName: payload.assistant.name,
      };

      log.info(
        `[Chat] Starting thread run with assistant: ${JSON.stringify(payload.assistant, null, 4)} and model ${JSON.stringify(payload.model, null, 4)}`
      );
      // Start streaming run
      const run = await this.openaiClient.beta.threads.runs
        .stream(conversation.threadId, {
          assistant_id: payload.assistant.id,
          model: payload.model.id,
        })
        .on("textCreated", () => {    
          log.debug(`[Stream Event Handler] Text created`)
          this.sendMessageToWebview("updateTypingStatus", { isTyping: true });
        })
        .on("textDelta", (delta, snapshot) => {
          log.info(`[Stream Event Handler] Received delta: ${delta.value}`);
          assistantMessage.content += delta.value;
          this.sendMessageToWebview("updateMessage", {
            messageId: assistantMessage.id,
            content: assistantMessage.content,
            modelName: assistantMessage.modelName,
            assistantName: assistantMessage.assistantName,
            timestamp: assistantMessage.timestamp,
          });
        })
        .on("toolCallCreated", (toolCall) => {
          log.debug(`[Stream Event Handler] Tool Call Created`)
          this.sendMessageToWebview("toolCall", { type: toolCall.type });
        })
        .on("toolCallDelta", (delta, snapshot) => {
          log.debug(`[Stream Event Handler] Tool Call Delta`)
          if (delta.type === "code_interpreter" && delta.code_interpreter) {
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
        .on('runStepDone', (runStep) => {
          log.debug('[Stream Event Handler] Run step completed', runStep);
          if (runStep.last_error) {
            const systemErrorMessage: Message = {
              id: crypto.randomUUID(),
              content: `Error: ${runStep.last_error.message}`,
              sender: "system",
              timestamp: new Date().toISOString(),
              modelName: payload.model.name,
              assistantName: payload.assistant.name,
            }
            conversation.messages = [...conversation.messages, systemErrorMessage];
            this.sendMessageToWebview("updateMessage", {
              messageId: systemErrorMessage.id,
              content: systemErrorMessage.content,
            });
          }
        }).on('toolCallDone', () => {
          log.debug('[Stream Event Handler] Tool call completed')
        }).on("end", async () => {
          log.debug("[Stream Event Handler] Stream ended");
          this.sendMessageToWebview("updateTypingStatus", { isTyping: false });
          if (assistantMessage.content) {
            conversation.messages = [...conversation.messages, assistantMessage];
          }
          await this.updateConversation(payload.accountId, conversation);
        })
        .on("error", async (error) => {
          log.error("[Stream Event Handler] Error processing chat message:", error);

          // Create and add system error message
          const systemErrorMessage: Message = {
            id: crypto.randomUUID(),
            content: `Error: ${error instanceof Error
              ? error.message
              : "Failed to process chat message"
              }`,
            sender: "system",
            timestamp: new Date().toISOString(),

            modelName: payload.model.name,
            assistantName: payload.assistant.name,
          };

          // Add the error message to conversation
          conversation.messages = [
            ...conversation.messages,
            systemErrorMessage,
          ];

          // Update the conversation with the error message
          this.sendMessageToWebview("updateTypingStatus", { isTyping: false });
          await this.updateConversation(payload.accountId, conversation);
        });

      this._currentRun = run;
    } catch (error) {
      log.error("[Chat] Error processing chat message:", error);

      // Create and add system error message
      const systemErrorMessage: Message = {
        id: crypto.randomUUID(),
        content: `Error: ${error instanceof Error
          ? error.message
          : "Failed to process chat message"
          }`,
        sender: "system",
        timestamp: new Date().toISOString(),
        modelName: payload.model.name,
        assistantName: payload.assistant.name,
      };

      // Add the error message to conversation
      conversation.messages = [...conversation.messages, systemErrorMessage];

      // Update the conversation with the error message
      await this.updateConversation(payload.accountId, conversation);
      this.sendMessageToWebview("updateTypingStatus", { isTyping: false });
    }
  }

  private async generateDocs(): Promise<{
    relativePath: string;
    path: string;
    filename: string;
    size: number;
    success: boolean;
  }> {
    log.info("[EventHandler] Starting documentation generation");
    log.info("[EventHandler] Checking workspace folders");
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders) {
      log.info("[EventHandler] No workspace folders found");
      this.sendMessageToWebview("error", {
        message: "No workspace folder open",
      });
      throw new Error("No workspace folder open");
    }

    log.info("[EventHandler] Setting up file paths");
    const rootPath = workspaceFolders[0].uri.fsPath;
    const sherpaDir = path.join(rootPath, ".sherpa-files");
    const markdownFileName = "project-documentation.txt";
    const markdownUri = vscode.Uri.file(path.join(sherpaDir, markdownFileName));

    try {
      log.info("[EventHandler] Creating .sherpa-files directory");
      await vscode.workspace.fs.createDirectory(vscode.Uri.file(sherpaDir));

      log.info("[EventHandler] Generating markdown content");
      const markdown = await this.generateMarkdownContent(rootPath);

      log.info("[EventHandler] Writing markdown file");
      const markdownContent = Buffer.from(markdown);
      await vscode.workspace.fs.writeFile(markdownUri, markdownContent);

      log.info("[EventHandler] Getting file stats");
      const fileStats = await fsProm.stat(markdownUri.fsPath);
      log.info("[EventHandler] Sending success message to webview");
      return {
        relativePath: markdownUri.fsPath.replace(rootPath, ""),
        path: markdownUri.fsPath,
        filename: markdownFileName,
        size: fileStats.size,
        success: true,
      };
    } catch (error) {
      log.error("[EventHandler] Error generating documentation:", error);
      this.sendMessageToWebview("error", {
        message: "Error generating documentation: " + (error as Error).message,
      });
      throw error;
    }
  }

  private async uploadFileToOpenAI(filePath: string): Promise<string> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new Error("No workspace folder open");
    }

    if (!this.openaiClient) {
      log.error("[EventHandler] OpenAI client not initialized");
      throw new Error("OpenAI client not initialized");
    }

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
        log.info(
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
    log.info(
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

      this.getAccounts();
    } else {
      log.info(
        `[Conversation Handler] Account not found with ID: ${accountId}`
      );
    }
  }

  private sendMessageToWebview(command: string, payload: any): void {
    log.info(`[Webview Message] Sending message:`, { command, payload });
    if (this.webviewView) {
      this.webviewView.webview.postMessage({ command, ...payload });
    }
  }

  private async getAccounts(): Promise<void> {
    const accounts = this.accountManager.getAccounts();
    const selectedAccountId = this.accountManager.getSelectedAccount();
    //this.initializeWithStoredAccount();
    log.info(`[Account Handler] Getting accounts:`, accounts);
    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: "updateAccounts",
        accounts: accounts,
        selectedAccountId: selectedAccountId,
      });
    }
  }

  private async initClient() : Promise<void>{
    const accounts = this.accountManager.getAccounts();
    const selectedAccountId = this.accountManager.getSelectedAccount();
    //this.initializeWithStoredAccount();
    log.info(`[Account Handler] Getting accounts:`, accounts);
    if (this.webviewView) {
      this.webviewView.webview.postMessage({
        command: "updateAccounts",
        accounts: accounts,
        selectedAccountId: selectedAccountId,
      });
      if (selectedAccountId !== undefined && selectedAccountId !== null) {
        this.initializeOpenAIClient(selectedAccountId);
      }
    }
  }

  private createNewConversation(selectedAccount: any, conversation: any): void {
    log.info(
      `[Conversation Handler] Creating new conversation:`,
      selectedAccount,
      conversation
    );
    if (selectedAccount) {
      selectedAccount.conversations = selectedAccount.conversations || [];
      selectedAccount.conversations.push(conversation);
      this.accountManager.storeAccount(selectedAccount);
      this.getAccounts();
    }
  }

  private async createAccount(account: any): Promise<void> {
    log.info(`[Account Handler] Creating new account:`, account);
    try {
      await this.accountManager.storeAccount(account);
    } catch (error) {
      log.error(`[Account Handler] Error creating account:`, error);
    } // Implement the logic to handle creating a new account
  }

  private async deleteAccount(accountId: string): Promise<void> {
    log.info(`[Account Handler] Deleting account with ID: ${accountId}`);
    await this.accountManager.deleteAccount(accountId);
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
