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
    <div className="flex justify-between items-center space-x-2 mb-2 w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled} className="min-w-0">
          <Button variant="outline" className="w-full justify-between" disabled={disabled}>
            <div className="text-sm text-muted-foreground break-words">
            {currentConversation?.title || "Select Conversation"}
            </div>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          <DropdownMenuLabel>Conversations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px]">
            {conversations?.map((conversation) => (
              <DropdownMenuItem 
                key={conversation.id} 
                onSelect={() => onSelectConversation(conversation)}
                disabled={disabled}
              >
                <div className="w-full">
                  <div className="font-medium">{conversation.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {conversation.date} • {conversation.messages?.length || 0} messages
                  </div>
                  <div className="text-sm text-muted-foreground break-words">
                    {conversation.lastMessage}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsDeleteDialogOpen(true)} variant="outline" disabled={disabled || !currentConversation}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </DialogTrigger>
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
        <DialogTrigger asChild>
          <Button onClick={() => setIsNewConversationDialogOpen(true)} variant="outline" disabled={disabled}>
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </DialogTrigger>
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
  )
}