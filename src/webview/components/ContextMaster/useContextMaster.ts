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
    const state = vscode.getState();
    if (state) {
      setAccounts(state.accounts || []);
      setSelectedAccountId(state.selectedAccountId || null);
    }
  }, []);

  const handleUpload = () => {
    setIsUploading(true);
    sendMessage('upload', { accountId: selectedAccountId });
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
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

  // Rest of the handlers...

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
    setSelectedAccountId,
    setSelectedAssistant,
    setSelectedModel,
    setNewAccountName,
    setNewAccountApiKey,
    toggleFullScreen: () => setIsFullScreen(!isFullScreen)
  };
}
