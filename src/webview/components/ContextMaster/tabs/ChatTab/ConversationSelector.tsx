import { Button } from "@/components/ui/button"
import { Plus, ChevronDown } from 'lucide-react'
import { Conversation } from "../../../../types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from "react";

interface ConversationSelectorProps {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  onNewConversation: () => void;
  onSelectConversation: (conversation: Conversation) => void;
}

export function ConversationSelector({
  currentConversation,
  conversations,
  onNewConversation,
  onSelectConversation
}: ConversationSelectorProps) {
  return (
    <div className="flex justify-between items-center space-x-2 mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {currentConversation?.title || "Select Conversation"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Conversations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {conversations?.map((conversation) => (
            <DropdownMenuItem 
              key={conversation.id} 
              onSelect={() => onSelectConversation(conversation)}
            >
              <div>
                <div>{conversation.title}</div>
                <div className="text-sm text-muted-foreground">
                  {conversation.date} • {conversation.messages} messages
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {conversation.lastMessage}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button onClick={onNewConversation} variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        New
      </Button>
    </div>
  )
}
