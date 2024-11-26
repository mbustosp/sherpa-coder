import { useContextMasterContext } from "../../context";
import { ConversationSelector } from "./ConversationSelector";
import { ChatWindow } from "./ChatWindow";
import { MessageInput } from "./MessageInput";
import React from "react";
import { WelcomeMessage } from "./WelcomeMessage";

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
    generateSourceCodeAttachment,
    sourceCode,
  } = useContextMasterContext();

  return (
    <div className="space-y-4 flex flex-col overflow-y-hidden">
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
          />
          <MessageInput
            sendMessage={handleSendChatMessage}
            assistants={assistants}
            models={models}
            selectedAssistant={selectedAssistant}
            setSelectedAssistant={setSelectedAssistant}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            generateSourceCodeAttachment={generateSourceCodeAttachment}
            sourceCode={sourceCode}
            isAssistantTyping={isAssistantTyping}
            disabled={!isClientInitialized || !currentConversation}
          />
        </>
      ) : (
        <WelcomeMessage />
      )}
    </div>
  );
}
