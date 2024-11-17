import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare } from 'lucide-react'
import { sendMessage } from "../../../../vscode"
import React from "react"

export function MessageInput() {
  const handleSendMessage = (message: string) => {
    sendMessage('sendMessage', { message });
  }

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const input = e.currentTarget.form?.elements.namedItem('userInput') as HTMLInputElement;
    handleSendMessage(input.value);
    input.value = '';
  }

  return (
    <div className="flex space-x-2">
      <Input 
        id="userInput" 
        placeholder="Type your message..." 
        className="flex-grow"
        onKeyPress={handleInputKeyPress}
      />
      <Button id="sendButton" onClick={handleButtonClick}>
        <MessageSquare className="w-4 h-4 mr-2" />
        Send
      </Button>
    </div>
  )
}