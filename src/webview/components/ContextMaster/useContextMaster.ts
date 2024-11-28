import * as React from "react";
import { Account, Conversation } from "../../types";
import { sendMessage } from "@/vscode";
import ReactDOM from "react-dom";

export function useContextMaster() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState<
    string | null
  >(null);
  const [currentConversation, setCurrentConversation] =
    React.useState<Conversation | null>(null);
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
  const [sourceCode, setSourceCode] = React.useState<{
    available: boolean;
    lastUpdated: Date | null;
    loading: boolean;
  }>({ available: false, lastUpdated: null, loading: false });

  // Add memoization for frequently accessed data
  const selectedAccount = React.useMemo(
    () => accounts.find((account) => account.id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  // Debounce function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }



  React.useEffect(() => {
    sendMessage("getAccounts", {});

    const messageHandler = (event: MessageEvent) => {
      console.debug("Received message:", event);
      const message = event.data;

      switch (message.command) {
        case "updateAccounts":
          console.debug("Updating accounts:", message.accounts);
          console.debug("Selected Account Id:", message.selectedAccountId);
          setAccounts(message.accounts);
          if (message.selectedAccountId) {
            setSelectedAccountId(message.selectedAccountId);
          }
          setIsLoading(false);
          break;
        case "updateConversation":
          updateConversation(message.conversation);
          break;
        case "updateLists":
          console.log("Updating lists:", {
            assistants: message.assistants,
            models: message.models,
          });
          setAssistants(message.assistants);
          setModels(
            message.models?.map((model) => ({ ...model, name: model.id }))
          );
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
        case "generateSourceCodeAttachmentStart":
          setSourceCode({
            available: false,
            lastUpdated: null,
            loading: true,
          });
          break;
        case "generateSourceCodeAttachmentSuccess":
          setSourceCode({
            available: true,
            lastUpdated: new Date(message?.uploadDate),
            loading: false,
          });
          break;
        case "generateSourceCodeAttachmentError":
          setSourceCode({
            available: false,
            lastUpdated: null,
            loading: false,
          });
          setError("Failed to generate docs");
          break;
        case "updateMessage":
          setCurrentConversation(prev => {
            if (!prev) return prev;
            
            // Check if the message exists
            const existingMessageIndex = prev.messages.findIndex(
              msg => msg.id === message.messageId
            );
        
            // If message doesn't exist, append it
            if (existingMessageIndex === -1) {
              return {
                ...prev,
                messages: [
                  ...prev.messages, 
                  {
                    id: message.messageId,
                    content: message.content,
                    sender: 'assistant', // Assuming it's an assistant message
                    timestamp: new Date().toISOString()
                  }
                ]
              };
            }
        
            // If message exists, update its content
            const updatedMessages = prev.messages.map(msg => 
              msg.id === message.messageId 
                ? { ...msg, content: message.content }
                : msg
            );
        
            return {
              ...prev,
              messages: updatedMessages
            };
          });
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

  React.useEffect(() => {
    if (selectedAssistant) {
      sendMessage("updateAssistant", { assistantId: selectedAssistant });
    }
  }, [selectedAssistant]);

  React.useEffect(() => {
    if (selectedModel) {
      sendMessage("updateModel", { modelId: selectedModel });
    }
  }, [selectedModel]);

  const handleCancelRun = () => {
    sendMessage("cancelRun", {});
  };

  const isClientInitialized =
    models?.length && selectedAccountId !== null && !isLoading;

  const createNewConversation = (conversationTitle: string) => {
    if (!selectedAccount) return;

    const newId = crypto.randomUUID();
    const newConversation = {
      id: newId,
      title: `Conversation ${conversationTitle || newId}`,
      date: new Date().toISOString().split("T")[0],
      messages: [],
      lastMessage: "",
    };

    console.log("Creating new conversation:", newConversation);

    const updatedAccount = {
      ...selectedAccount,
      conversations: selectedAccount.conversations?.length
        ? [...selectedAccount.conversations, newConversation]
        : [newConversation],
    };

    setAccounts(
      accounts.map((account) =>
        account.id === selectedAccount.id ? updatedAccount : account
      )
    );
    setCurrentConversation(newConversation);
    sendMessage("newConversation", {
      selectedAccount,
      conversation: newConversation,
    });
  };

  // Batch conversation updates
  const updateConversation = React.useCallback(
    (conversation: Conversation) => {
      ReactDOM.unstable_batchedUpdates(() => {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === selectedAccountId
              ? {
                  ...account,
                  conversations: account.conversations.map((conv) =>
                    conv.id === conversation.id ? conversation : conv
                  ),
                }
              : account
          )
        );
        setCurrentConversation(conversation);
      });
    },
    [selectedAccountId]
  );

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
      conversationId,
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

  const handleRemoveExtensionData = () => {
    sendMessage("removeExtensionData", {});
    setAccounts([]);
    setSelectedAccountId(null);
    setCurrentConversation(null);
    setNewAccountName("");
    setNewAccountApiKey("");
    setError(null);
    setSelectedAssistant("");
    setSelectedModel("");
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

  const handleSendChatMessage = (message: string, attachDoc?: boolean) => {
    if (!currentConversation || !selectedAccount) return;

    sendMessage("sendChatMessage", {
      accountId: selectedAccount.id,
      conversationId: currentConversation.id,
      message,
      assistant: selectedAssistant,
      model: selectedModel,
      attachDoc,
    });
  };

  const dismissError = () => {
    setError(null);
  };

  const generateSourceCodeAttachment = () => {
    sendMessage("generateSourceCodeAttachment", {});
  };

  return {
    accounts,
    selectedAccountId,
    selectedAccount,
    currentConversation,
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
    createNewConversation,
    handleCreateAccount,
    handleDeleteAccount,
    handleDeleteConversation,
    onSelectConversation,
    setCurrentConversation,
    sendMessageToExtension: sendMessage,
    handleSendChatMessage,
    dismissError,
    handleRemoveExtensionData,
    sourceCode,
    generateSourceCodeAttachment,
    handleCancelRun,
  };
}
