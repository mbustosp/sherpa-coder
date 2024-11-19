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
    handleSendChatMessage
  } = useContextMasterContext()

  return (
    <div className="space-y-4">
      <ConversationSelector 
        currentConversation={currentConversation}
        conversations={selectedAccount?.conversations || []}
        onNewConversation={createNewConversation}
        onSelectConversation={setCurrentConversation}
      />
      <ChatWindow />
      <MessageInput sendMessage={handleSendChatMessage} />
    </div>
  )
}
