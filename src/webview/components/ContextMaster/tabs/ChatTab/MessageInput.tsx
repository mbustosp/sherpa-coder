import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/webview/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/webview/components/ui/popover";
import { Switch } from "@/webview/components/ui/switch";
import { Label } from "@/webview/components/ui/label";

interface Assistant {
  id: string;
  name: string;
}

interface Model {
  id: string;
}

interface MessageInputProps {
  sendMessage: (message: string, attachDoc: boolean) => void;
  assistants: Assistant[];
  models: Model[];
  selectedAssistant: string;
  setSelectedAssistant: (assistant: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  disabled?: boolean;
  isAssistantTyping: boolean;
  hasDocumentation?: boolean;
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
  hasDocumentation = false,
}: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [attachDoc, setAttachDoc] = React.useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message, attachDoc);
      setMessage("");
      setAttachDoc(false);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col border rounded-lg bg-background shadow-sm">
      <Textarea
        placeholder="Type your message..."
        className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px] max-h-[200px]"
        disabled={disabled}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleInputKeyPress}
      />
      <div className="flex items-center justify-between p-2 border-t">
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Assistant</h4>
                  <Select
                    value={selectedAssistant}
                    onValueChange={setSelectedAssistant}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Assistant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Assistants</SelectLabel>
                        {assistants.map((assistant) => (
                          <SelectItem key={assistant.id} value={assistant.id}>
                            {assistant.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Model</h4>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Models</SelectLabel>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.id}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {hasDocumentation && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="attach-doc"
                      checked={attachDoc}
                      onCheckedChange={setAttachDoc}
                    />
                    <Label
                      htmlFor="attach-doc"
                      className="text-sm cursor-pointer"
                    >
                      Include project source
                    </Label>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {isAssistantTyping && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Assistant is typing...
            </span>
          )}
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={disabled || !message.trim()}
          size="sm"
          className={cn("px-4", !message.trim() && "opacity-50")}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
}
