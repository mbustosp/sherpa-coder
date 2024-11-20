import * as React from "react";
import { Account, Conversation } from "../../types";
import { sendMessage } from "@/vscode";

export function useContextMaster() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState<
    string | null
  >(null);
  const [currentConversation, setCurrentConversation] =
    React.useState<Conversation | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [docsGenerated, setDocsGenerated] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [selectedAssistant, setSelectedAssistant] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("");
  const [newAccountName, setNewAccountName] = React.useState("");
  const [newAccountApiKey, setNewAccountApiKey] = React.useState("");
  const [assistants, setAssistants] = React.useState([]);
  const [models, setModels] = React.useState([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = React.useState(false);

  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) || null;

  React.useEffect(() => {
    sendMessage("getAccounts", {});

    const messageHandler = (event: MessageEvent) => {
      console.debug("Received message:", event);
      const message = event.data;

      switch (message.command) {
        case "updateAccounts":
          console.debug("Updating accounts:", message.accounts);
          setAccounts(message.accounts);
          setIsLoading(false);
          break;
        case "updateConversation":
          console.debug("Updating conversation:", message.conversation);
          setCurrentConversation(message.conversation);
          break;
        case "uploadComplete":
          console.debug("Upload completed");
          setIsUploading(false);
          setDocsGenerated(true);
          break;
        case "updateLists":
          console.log("Updating lists:", {
            assistants: message.assistants,
            models: message.models,
          });
          setAssistants(message.assistants);
          setModels(message.models);
          setIsLoading(false);
          break;
        case "error":
          console.debug("Error received:", message.message);
          setError(message.message);
          setIsLoading(false);
          break;
        case "updateTypingStatus":
          setIsAssistantTyping(message.isTyping);
          setIsLoading(message.isTyping);
          break;
      }
    };
    window.addEventListener("message", messageHandler);
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, [sendMessage]);

  React.useEffect(() => {
    if (selectedAccountId) {
      setIsLoading(true);
      sendMessage("selectAccount", { accountId: selectedAccountId });
    }
  }, [selectedAccountId, sendMessage]);

  React.useEffect(() => {
    if (assistants.length > 0) {
      setSelectedAssistant(assistants[0].id);
    }
  }, [assistants]);

  React.useEffect(() => {
    if (models.length > 0) {
      setSelectedModel(models[0].id);
    }
  }, [models]);

  const isClientInitialized =
    models?.length && selectedAccountId !== null && !isLoading;

  const handleUpload = () => {
    setIsUploading(true);
    sendMessage("upload", { accountId: selectedAccountId });
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setDocsGenerated(true);
          return 0;
        }
        return prev + 10;
      });
    }, 500);
  };

  const createNewConversation = () => {
    if (!selectedAccount) return;

    const newId = crypto.randomUUID();
    const newConversation = {
      id: newId,
      title: `Conversation ${newId}`,
      date: new Date().toISOString().split("T")[0],
      messages: [],
      lastMessage: "",
    };

    const updatedAccount = {
      ...selectedAccount,
      conversations: selectedAccount.conversations?.length
        ? [...selectedAccount.conversations, newConversation]
        : [newConversation],
    };

    setCurrentConversation(newConversation);
    sendMessage("newConversation", { conversation: newConversation });
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (!selectedAccount) return;

    const updatedAccount = {
      ...selectedAccount,
      conversations: selectedAccount.conversations.filter(
        (conv) => conv.id !== conversationId
      ),
    };

    setAccounts(
      accounts.map((account) =>
        account.id === selectedAccount.id ? updatedAccount : account
      )
    );

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }

    sendMessage("deleteConversation", { 
      accountId: selectedAccount.id,
      conversationId 
    });
  };

  const handleCreateAccount = () => {
    if (!newAccountName || !newAccountApiKey) return;

    const newAccount: Account = {
      id: String(accounts.length + 1),
      name: newAccountName,
      apiKey: newAccountApiKey,
      conversations: [],
      assistants: [],
      models: [],
    };

    setAccounts([...accounts, newAccount]);
    setNewAccountName("");
    setNewAccountApiKey("");
    sendMessage("createAccount", { account: newAccount });
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(accounts.filter((account) => account.id !== accountId));
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null);
      setCurrentConversation(null);
    }
    sendMessage("deleteAccount", { accountId });
  };

  const onSelectConversation = (conversationId: string) => {
    if (!selectedAccount) return;

    const conversation = selectedAccount.conversations.find(
      (conv) => conv.id === conversationId
    );
    if (conversation) {
      setCurrentConversation(conversation);
      sendMessage("selectConversation", { conversationId });
    }
  };

  const setCurrentConversationR = (conversation: Conversation | null) => {
    setCurrentConversation(conversation);
    if (conversation) {
      sendMessage("updateConversation", { conversation });
    }
  };

  const handleSendChatMessage = (message: string) => {
    if (!currentConversation || !selectedAccount) return;

    sendMessage("sendChatMessage", {
      accountId: selectedAccount.id,
      conversationId: currentConversation.id,
      message,
      assistant: selectedAssistant,
      model: selectedModel,
    });
  };

  const dismissError = () => {
    setError(null);
  };

  return {
    accounts,
    selectedAccountId,
    selectedAccount,
    currentConversation,
    isUploading,
    uploadProgress,
    docsGenerated,
    isFullScreen,
    selectedAssistant,
    selectedModel,
    newAccountName,
    newAccountApiKey,
    assistants,
    models,
    error,
    isClientInitialized,
    isLoading,
    isAssistantTyping,
    setSelectedAccountId,
    setSelectedAssistant,
    setSelectedModel,
    setNewAccountName,
    setNewAccountApiKey,
    toggleFullScreen: () => setIsFullScreen(!isFullScreen),
    handleUpload,
    createNewConversation,
    handleCreateAccount,
    handleDeleteAccount,
    handleDeleteConversation,
    onSelectConversation,
    setCurrentConversation: setCurrentConversation,
    sendMessageToExtension: sendMessage,
    handleSendChatMessage,
    dismissError,
  };
}