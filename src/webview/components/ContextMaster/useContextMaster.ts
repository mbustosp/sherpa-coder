import * as React from "react";
import { Account, Conversation } from "../../types";
import { vscode, sendMessage } from "../../vscode";

export function useContextMaster() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [docsGenerated, setDocsGenerated] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [selectedAssistant, setSelectedAssistant] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("");
  const [newAccountName, setNewAccountName] = React.useState("");
  const [newAccountApiKey, setNewAccountApiKey] = React.useState("");
  const [currentConversation, setCurrentConversation] = React.useState<Conversation | null>(null);

  const selectedAccount = accounts.find(account => account.id === selectedAccountId) || null;

  React.useEffect(() => {
    sendMessage('getAccounts', {});

    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      switch (message.command) {
        case 'updateAccounts':
          setAccounts(message.accounts);
          break;
        case 'updateConversation':
          setCurrentConversation(message.conversation);
          break;
        case 'uploadComplete':
          setIsUploading(false);
          setDocsGenerated(true);
          break;
      }
    };
    window.addEventListener('message', messageHandler);
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  const handleUpload = () => {
    setIsUploading(true);
    sendMessage('upload', { accountId: selectedAccountId });
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

    const newId = selectedAccount.conversations.length + 1;
    const newConversation = { 
      id: newId, 
      title: `Conversation ${newId}`, 
      date: new Date().toISOString().split('T')[0],
      messages: 0,
      lastMessage: ""
    };
    
    const updatedAccount = {
      ...selectedAccount,
      conversations: [...selectedAccount.conversations, newConversation]
    };
    
    setAccounts(accounts.map(account => 
      account.id === selectedAccount.id ? updatedAccount : account
    ));
    setCurrentConversation(newConversation);
    sendMessage('newConversation', { conversation: newConversation });
  };

  const handleCreateAccount = () => {
    if (!newAccountName || !newAccountApiKey) return;

    const newAccount: Account = {
      id: String(accounts.length + 1),
      name: newAccountName,
      apiKey: newAccountApiKey,
      conversations: [],
      assistants: [],
      models: []
    };

    setAccounts([...accounts, newAccount]);
    setNewAccountName("");
    setNewAccountApiKey("");
    sendMessage('createAccount', { account: newAccount });
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(accounts.filter(account => account.id !== accountId));
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null);
      setCurrentConversation(null);
    }
    sendMessage('deleteAccount', { accountId });
  };

  const onSelectConversation = (conversationId: string) => {
    if (!selectedAccount) return;

    const conversation = selectedAccount.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      sendMessage('selectConversation', { conversationId });
    }
  };

  const setCurrentConversationR = (conversation: Conversation | null) => {
    setCurrentConversation(conversation);
    if (conversation) {
      sendMessage('updateConversation', { conversation });
    }
  };

  const sendMessageToExtension = (command: string, payload: any) => {
    sendMessage(command, payload);
  };

  const handleSendChatMessage = (message: string) => {
    if (!currentConversation || !selectedAccount) return;
    
    sendMessage('sendChatMessage', {
      accountId: selectedAccount.id,
      conversationId: currentConversation.id,
      message,
      assistant: selectedAssistant,
      model: selectedModel
    });
  };

  return {
    accounts,
    selectedAccountId,
    isUploading,
    uploadProgress,
    docsGenerated,
    isFullScreen,
    selectedAssistant,
    selectedModel,
    newAccountName,
    newAccountApiKey,
    currentConversation,
    selectedAccount,
    handleUpload,
    createNewConversation,
    handleCreateAccount,
    handleDeleteAccount,
    onSelectConversation,
    setCurrentConversation: setCurrentConversationR,
    setSelectedAccountId,
    setSelectedAssistant,
    setSelectedModel,
    setNewAccountName,
    setNewAccountApiKey,
    toggleFullScreen: () => setIsFullScreen(!isFullScreen),
    sendMessageToExtension,
    handleSendChatMessage
  };
}