import { useContextMasterContext } from "../../context"
import { ConversationSelector } from "./ConversationSelector"
import { ChatWindow } from "./ChatWindow"
import { MessageInput } from "./MessageInput"
import React from "react"

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
  } = useContextMasterContext()

  return (
    <div className="space-y-4">
      <ConversationSelector 
        disabled={!isClientInitialized}
        onDeleteConversation={handleDeleteConversation}
        currentConversation={currentConversation}
        conversations={selectedAccount?.conversations || []}
        onNewConversation={createNewConversation}
        onSelectConversation={setCurrentConversation}
      />
      <ChatWindow 
        messages={currentConversation?.messages || []} 
        error={error}
        isAssistantTyping={isAssistantTyping}
      />
      <MessageInput sendMessage={handleSendChatMessage} disabled={!isClientInitialized} />
    </div>
  )
}