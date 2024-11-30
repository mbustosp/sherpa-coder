import { ConversationSelector } from "../conversationSelector";
import { ChatWindow } from "../chatWindow";
import { MessageInput } from "../messageInput";
import React from "react";
import { WelcomeMessage } from "../welcomeMessage";
import { useGlobalContext } from "@/webview/providers/globalStateContext";

export function ChatTab() {
  const {
    currentConversation,
    selectedAccount,
    createNewConversation,
    setCurrentConversation,
    handleSendChatMessage,
    handleDeleteConversation,
    isClientInitialized,
    error,
    isAssistantTyping,
    assistants,
    models,
    selectedModel,
    selectedAssistant,
    setSelectedAssistant,
    setSelectedModel,
    handleCancelRun,
    workspaceFiles,
    requestWorkspaceFiles,
  } = useGlobalContext();

  return (
    <div className="space-y-4 flex flex-col flex-auto overflow-y-hidden">
      <ConversationSelector
        disabled={!isClientInitialized}
        onDeleteConversation={handleDeleteConversation}
        currentConversation={currentConversation}
        conversations={selectedAccount?.conversations || []}
        onNewConversation={createNewConversation}
        onSelectConversation={setCurrentConversation}
      />
      {currentConversation ? (
        <>
          <ChatWindow
            messages={currentConversation?.messages || []}
            error={error || undefined}
            isAssistantTyping={isAssistantTyping}
            handleCancelRun={handleCancelRun}
          />
          <MessageInput
            sendMessage={handleSendChatMessage}
            assistants={assistants}
            models={models}
            selectedAssistant={selectedAssistant}
            setSelectedAssistant={setSelectedAssistant}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            disabled={!isClientInitialized || !currentConversation}
            requestWorkspaceFiles={requestWorkspaceFiles}
            files={workspaceFiles}
          />
        </>
      ) : (
        <WelcomeMessage />
      )}
    </div>
  );
}
