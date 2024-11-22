import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare } from "lucide-react";
import { Textarea } from "@/webview/components/ui/textarea";

interface Assistant {
  id: string;
  name: string;
}

interface Model {
  id: string;
}

interface MessageInputProps {
  sendMessage: (message: string) => void;
  assistants: Assistant[];
  models: Model[];
  selectedAssistant: string;
  setSelectedAssistant: (assistant: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  disabled?: boolean;
  isAssistantTyping: boolean;
}

export function MessageInput({
  sendMessage,
  assistants,
  models,
  selectedAssistant,
  setSelectedAssistant,
  selectedModel,
  setSelectedModel,
  disabled = false,
  isAssistantTyping,
}: MessageInputProps) {
  const [message, setMessage] = React.useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col border rounded-lg bg-background">
      <Textarea
        placeholder="Type your message..."
        className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px] max-h-[200px]"
        disabled={disabled}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleInputKeyPress}
      />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 border-t space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground w-full sm:w-auto">
            <span className="whitespace-nowrap">The assistant</span>
            <Select
              value={selectedAssistant}
              onValueChange={setSelectedAssistant}
            >
              <SelectTrigger className="h-8 w-full sm:w-[180px] text-xs border bg-transparent hover:bg-accent px-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full">
                <SelectValue placeholder="Select Assistant" />
              </SelectTrigger>
              <SelectContent>
                {assistants.map((assistant) => (
                  <SelectItem
                    key={assistant.id}
                    value={assistant.id}
                    className="text-xs"
                  >
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground w-full sm:w-auto">
            <span className="whitespace-nowrap">will answer using</span>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-8 w-full sm:w-[180px] text-xs border bg-transparent hover:bg-accent px-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    className="text-xs"
                  >
                    {model.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
          {isAssistantTyping && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Typing...
            </span>
          )}
          <Button 
            onClick={handleSendMessage} 
            disabled={disabled || !message.trim()} 
            size="sm" 
            className="px-4 w-full sm:w-auto"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}