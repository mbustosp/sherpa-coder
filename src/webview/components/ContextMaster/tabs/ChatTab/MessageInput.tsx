import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare } from 'lucide-react'
import React, { useRef } from "react"

interface MessageInputProps {
  sendMessage: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ sendMessage, disabled = false }: MessageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  }

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputRef.current?.value || '');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  const handleButtonClick = () => {
    if (inputRef.current) {
      handleSendMessage(inputRef.current.value);
      inputRef.current.value = '';
    }
  }

  return (
    <div className="flex space-x-2">
      <Input 
        id="userInput" 
        placeholder="Type your message..." 
        className="flex-grow"
        onKeyPress={handleInputKeyPress}
        ref={inputRef}
        disabled={disabled}
      />
      <Button id="sendButton" onClick={handleButtonClick} disabled={disabled}>
        <MessageSquare className="w-4 h-4 mr-2" />
        Send
      </Button>
    </div>
  )
}