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
import { MessageSquare, Settings, FileCode2, RefreshCw, Upload, Check, ChevronDown, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/webview/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/webview/components/ui/popover";
import { Badge } from "@/webview/components/ui/badge";
import { Switch } from "@/webview/components/ui/switch";
import { Label } from "@/webview/components/ui/label";

interface Assistant {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
}

interface MessageInputProps {
  sendMessage: (message: string, includeSourceCode: boolean) => void;
  assistants: Assistant[];
  models: Model[];
  selectedAssistant: string;
  setSelectedAssistant: (assistant: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  disabled?: boolean;
  isAssistantTyping: boolean;
  sourceCode: {
    available: boolean;
    lastUpdated: Date | null;
    loading: boolean;
  };
  generateSourceCodeAttachment: () => void;
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
  sourceCode,
  generateSourceCodeAttachment,
}: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [includeSourceCode, setIncludeSourceCode] = React.useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message, includeSourceCode);
      setMessage("");
      setIncludeSourceCode(false);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSelectedAssistantName = () => {
    return assistants.find(a => a.id === selectedAssistant)?.name || "Select Assistant";
  };

  const getSelectedModelName = () => {
    return models.find(m => m.id === selectedModel)?.name || "Select Model";
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
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Assistant</h4>
                  <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
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
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Models</SelectLabel>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Source Code</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate and upload project source code for better context.
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      onClick={generateSourceCodeAttachment}
                      disabled={sourceCode.loading}
                    >
                      <FileCode2 className="w-3 h-3 mr-1" />
                      {sourceCode.loading ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : sourceCode.available ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Regenerate
                        </>
                      ) : (
                        "Generate & Upload"
                      )}
                    </Button>
                    {sourceCode.lastUpdated && (
                      <Badge variant="secondary" className="text-xs">
                        Updated: {sourceCode.lastUpdated.toLocaleTimeString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-source"
                    checked={includeSourceCode}
                    onCheckedChange={setIncludeSourceCode}
                    disabled={!sourceCode.available}
                  />
                  <Label htmlFor="include-source" className="text-sm cursor-pointer">
                    Include source code
                  </Label>
                  {!sourceCode.available && (
                    <Info className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {sourceCode.available
                  ? "Include project source code in your message"
                  : "Generate source code in settings first"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
