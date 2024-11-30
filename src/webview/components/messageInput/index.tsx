import * as React from "react";
import { Button } from "@/webview/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/webview/components/ui/tabs";
import {
  MessageSquare,
  Settings,
  Bot,
  Sparkles,
  FileCode2,
  X,
  Paperclip,
  File,
} from "lucide-react";
import { cn } from "@/webview/lib/cn";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/webview/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/webview/components/ui/command";
import { Textarea } from "@/webview/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/webview/components/ui/scroll-area";
import { Badge } from "@/webview/components/ui/badge";
import { Assistant, ContextItem, Model } from "src/types";



interface MessageInputProps {
  sendMessage: (message: string, context: ContextItem[]) => void;
  assistants: Assistant[];
  models: Model[];
  selectedAssistant: string;
  setSelectedAssistant: (assistant: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  disabled?: boolean;
  isAssistantTyping?: boolean;
  files: string[];
  requestWorkspaceFiles: () => void;
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
  requestWorkspaceFiles,
  files = [],
}: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);
  const [isContextDialogOpen, setIsContextDialogOpen] = React.useState(false);
  const [tempSelectedAssistant, setTempSelectedAssistant] =
    React.useState(selectedAssistant);
  const [tempSelectedModel, setTempSelectedModel] =
    React.useState(selectedModel);
  const [contextItems, setContextItems] = React.useState<ContextItem[]>([]);
  const [newContextItem, setNewContextItem] = React.useState("");
  const [filteredFiles, setFilteredFiles] = React.useState<string[]>([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message, contextItems);
      setMessage("");
      setContextItems([]);
    }
  };

  React.useEffect(() => {
    requestWorkspaceFiles();
  }, []);

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "@") {
      e.preventDefault();
      setIsContextDialogOpen(true);
    }
  };

  const handleSettingsDialogClose = (save: boolean) => {
    if (save) {
      setSelectedAssistant(tempSelectedAssistant);
      setSelectedModel(tempSelectedModel);
    } else {
      setTempSelectedAssistant(selectedAssistant);
      setTempSelectedModel(selectedModel);
    }
    setIsSettingsDialogOpen(false);
  };

  const handleAddContext = (file: string) => {
    setContextItems((prev) => [...prev, { type: "file", name: file }]);
    setNewContextItem("");
    setFilteredFiles([]);
  };

  const handleAddSourceCode = () => {
    setContextItems((prev) => [
      ...prev,
      { type: "sourceCode", name: "Source Code" },
    ]);
    setIsContextDialogOpen(false);
  };

  const handleRemoveContext = (index: number) => {
    setContextItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewContextItemChange = (value: string) => {
    setNewContextItem(value);
    if (value.trim()) {
      setFilteredFiles(
        files.filter((file) => file.toLowerCase().includes(value.toLowerCase()))
      );
    } else {
      setFilteredFiles([]);
    }
  };

  const selectedModelDetails =
    models.find((m) => m.id === selectedModel) || models[0];
  const selectedAssistantDetails =
    assistants.find((a) => a.id === selectedAssistant) || assistants[0];

  return (
    <div className="flex flex-col border rounded-lg bg-background shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <span>Model: {selectedModelDetails.name}</span>
          <span>•</span>
          <span>Assistant: {selectedAssistantDetails.name}</span>
        </div>
      </div>
      <div className="relative">
        <Textarea
          placeholder="Type your message... (Use @ to add context)"
          className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-[100px] pr-20"
          disabled={disabled}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleInputKeyPress}
        />
        {contextItems.length > 0 && (
          <ScrollArea className="absolute bottom-2 left-2 right-16 h-8">
            <div className="flex space-x-2">
              {contextItems.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="h-6 px-2 text-xs"
                >
                  {item.type === "sourceCode" ? (
                    <FileCode2 className="w-3 h-3 mr-1" />
                  ) : (
                    <Paperclip className="w-3 h-3 mr-1" />
                  )}
                  {item.name}
                  <button
                    onClick={() => handleRemoveContext(index)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
      <div className="flex items-center justify-between p-2 border-t">
        <Dialog
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
        >
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="model">Model</TabsTrigger>
                <TabsTrigger value="assistant">Assistant</TabsTrigger>
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
            </Tabs>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleSettingsDialogClose(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => handleSettingsDialogClose(true)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isContextDialogOpen}
          onOpenChange={setIsContextDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Context</DialogTitle>
            </DialogHeader>
            <Command>
              <CommandInput
                placeholder="Search files..."
                value={newContextItem}
                onValueChange={handleNewContextItemChange}
              />
              <CommandList>
                <CommandEmpty>No files found.</CommandEmpty>
                <CommandGroup heading="Files">
                  {filteredFiles.map((file) => (
                    <CommandItem
                      key={file}
                      onSelect={() => handleAddContext(file)}
                    >
                      <File className="mr-2 h-4 w-4" />
                      <span>{file}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <Button onClick={handleAddSourceCode} className="w-full mt-2">
              <FileCode2 className="w-4 h-4 mr-2" />
              Add Source Code
            </Button>
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
