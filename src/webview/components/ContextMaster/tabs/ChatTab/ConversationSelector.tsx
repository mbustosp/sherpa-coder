import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Conversation } from "../../../../types"
import { DialogHeader, DialogFooter, Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/webview/components/ui/dialog"
import { Label } from "@/webview/components/ui/label"
import { ScrollArea } from "@/webview/components/ui/scroll-area"


interface ConversationSelectorProps {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  onNewConversation: (title: string) => void;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  disabled?: boolean;
}

export function ConversationSelector({
  currentConversation,
  conversations,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  disabled = false
}: ConversationSelectorProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false)
  const [newConversationTitle, setNewConversationTitle] = useState("")

  const handleDeleteConversation = () => {
    if (currentConversation) {
      onDeleteConversation(currentConversation.id)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleNewConversation = () => {
    if (newConversationTitle.trim()) {
      onNewConversation(newConversationTitle.trim())
      setNewConversationTitle("")
      setIsNewConversationDialogOpen(false)
    }
  }

  return (
    <div className="flex justify-between items-center w-full flex-wrap min-h-9">
      <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled} className="min-w-0">
        <Button variant="outline" className="w-full justify-between" disabled={disabled}>
          <div className="text-sm text-muted-foreground break-words overflow-x-hidden">
            {currentConversation?.title || "Select Conversation"}
          </div>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Conversations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuItem 
            onSelect={() => setIsNewConversationDialogOpen(true)}
            disabled={disabled}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Conversation</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {conversations.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No conversations yet. Create one to get started!
            </div>
          ) : (
            conversations.map((conversation) => (
              <DropdownMenuItem 
                key={conversation.id} 
                onSelect={() => onSelectConversation(conversation)}
                disabled={disabled}
                className="cursor-pointer"
              >
                <div className="w-full flex justify-between items-start">
                  <div className="flex-grow pr-2">
                    <div className="font-medium">{conversation.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {conversation.date} • {conversation.messages?.length || 0} messages
                    </div>
                    <div className="text-sm text-muted-foreground break-words">
                      {conversation.messages[0]?.content?.slice(0, 100) || ''}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conversation.id)
                    }}
                    className="h-6 w-6 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
      <div className="flex flex-grow gap-2">
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConversation}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewConversationDialogOpen} onOpenChange={setIsNewConversationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>
              Enter a title for your new conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Title
              </Label>
              <Input
                id="name"
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewConversationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleNewConversation}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}