import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { MessageSquare, Settings, Bot, Sparkles, FileCode2, Upload } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Textarea } from "@/webview/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/webview/components/ui/dialog";
import { ScrollArea } from "@/webview/components/ui/scroll-area";

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
  };
  generateSourceCode: () => void;
  uploadSourceCode: () => void;
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
  generateSourceCode,
  uploadSourceCode,
}: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [includeSourceCode, setIncludeSourceCode] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [tempSelectedAssistant, setTempSelectedAssistant] = React.useState(selectedAssistant);
  const [tempSelectedModel, setTempSelectedModel] = React.useState(selectedModel);

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

  const handleDialogClose = (save: boolean) => {
    if (save) {
      setSelectedAssistant(tempSelectedAssistant);
      setSelectedModel(tempSelectedModel);
    } else {
      setTempSelectedAssistant(selectedAssistant);
      setTempSelectedModel(selectedModel);
    }
    setIsDialogOpen(false);
  };

  const selectedModelDetails = models.find(m => m.id === selectedModel);
  const selectedAssistantDetails = assistants.find(a => a.id === selectedAssistant);

  return (
    <div className="flex flex-col border rounded-lg bg-background shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <span>Model: {selectedModelDetails?.name || "Not selected"}</span>
          <span>•</span>
          <span>Assistant: {selectedAssistantDetails?.name || "Not selected"}</span>
        </div>
        {isAssistantTyping && (
          <span className="animate-pulse">Assistant is typing...</span>
        )}
      </div>
      <Textarea
        placeholder="Type your message..."
        className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-[100px]"
        disabled={disabled}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleInputKeyPress}
      />
      <div className="flex items-center justify-between p-2 border-t">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <Settings className="w-3 h-3 mr-2" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chat Settings</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="model" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="model">Model</TabsTrigger>
                <TabsTrigger value="assistant">Assistant</TabsTrigger>
                <TabsTrigger value="source">Source Code</TabsTrigger>
              </TabsList>
              <TabsContent value="model">
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className={cn(
                        "flex items-center space-x-2 rounded-lg p-2 hover:bg-accent cursor-pointer",
                        tempSelectedModel === model.id && "bg-accent"
                      )}
                      onClick={() => setTempSelectedModel(model.id)}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{model.name}</span>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="assistant">
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {assistants.map((assistant) => (
                    <div
                      key={assistant.id}
                      className={cn(
                        "flex items-center space-x-2 rounded-lg p-2 hover:bg-accent cursor-pointer",
                        tempSelectedAssistant === assistant.id && "bg-accent"
                      )}
                      onClick={() => setTempSelectedAssistant(assistant.id)}
                    >
                      <Bot className="w-4 h-4" />
                      <span>{assistant.name}</span>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="source">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-source"
                      checked={includeSourceCode}
                      onChange={(e) => setIncludeSourceCode(e.target.checked)}
                    />
                    <label htmlFor="include-source">Include Source Code</label>
                  </div>
                  <Button onClick={generateSourceCode} className="w-full">
                    <FileCode2 className="w-4 h-4 mr-2" />
                    Generate Source Code
                  </Button>
                  <Button onClick={uploadSourceCode} className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Source Code
                  </Button>
                  {sourceCode.available && (
                    <p className="text-xs text-muted-foreground">
                      Last updated: {sourceCode.lastUpdated?.toLocaleString()}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleDialogClose(true)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          onClick={handleSendMessage}
          disabled={disabled || !message.trim()}
          size="sm"
          className={cn(!message.trim() && "opacity-50")}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
}
