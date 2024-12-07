import * as React from "react";
import { Button } from "@/webview/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/webview/components/ui/tabs";
import {
  MessageSquare,
  Settings,
  Bot,
  Sparkles,
  FileCode2,
  X,
  Paperclip,
  File,
  FolderTree,
  RefreshCw
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/webview/components/ui/tooltip";
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
  refreshModelsAndAssistants: () => void;
  loadingModelsAndAssistants: boolean;
  handleCancelRun: () => void;
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
  isAssistantTyping = false,
  requestWorkspaceFiles,
  files = [],
  refreshModelsAndAssistants,
  loadingModelsAndAssistants = false,
  handleCancelRun
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
  const [filteredFiles, setFilteredFiles] = React.useState<string[]>(files);

  React.useEffect(() => {
    requestWorkspaceFiles();
  }, []);

  React.useEffect(() => {
    setFilteredFiles(files);
  }, [files]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message, contextItems);
      setMessage("");
      setContextItems([]);
    }
  };

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
    const isFileAlreadyAdded = contextItems.some(
      (item) => item.type === "file" && item.name === file
    );

    if (!isFileAlreadyAdded) {
      setContextItems((prev) => [...prev, { type: "file", name: file }]);
    }
    setNewContextItem("");
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
    setFilteredFiles(
      value.trim()
        ? files.filter((file) =>
            file.toLowerCase().includes(value.toLowerCase())
          )
        : files
    );
  };

  const selectedModelDetails =
    models.length > 0
      ? models.find((m) => m.id === selectedModel) || models[0]
      : { id: "", name: "⚠️ No models available" };
  const selectedAssistantDetails =
    assistants.length > 0
      ? assistants.find((a) => a.id === selectedAssistant) || assistants[0]
      : { id: "", name: "⚠️ No assistants available" };

  const isSendDisabled =
    disabled ||
    !message.trim() ||
    !selectedModel ||
    !selectedAssistant ||
    isAssistantTyping;

  return (
    <div className="flex flex-col rounded-lg bg-background shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-secondary text-xs text-secondary-foreground">
        <div className="flex items-center space-x-2">
          <span>Model: {selectedModelDetails.name}</span>
          <span>•</span>
          <span>
            Assistant:{" "}
            {selectedAssistantDetails.name || `${selectedAssistantDetails.id}`}
          </span>
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
          <ScrollArea className="absolute bottom-2 left-2 right-16 h-8 max-w-[95%]">
            <div className="flex space-x-2">
              {contextItems.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="h-6 px-2 text-xs flex items-center whitespace-nowrap"
                >
                  {item.type === "sourceCode" ? (
                    <FileCode2 className="w-3 h-3 mr-1 flex-shrink-0" />
                  ) : (
                    <Paperclip className="w-3 h-3 mr-1 flex-shrink-0" />
                  )}
                  <span className="truncate max-w-[100px]">{item.name}</span>
                  <button
                    onClick={() => handleRemoveContext(index)}
                    className="ml-1 text-muted-foreground hover:text-foreground flex-shrink-0"
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
      <div className="flex items-center justify-between p-2 flex-wrap gap-4">
        <div className="flex flex-wrap gap-2">
          <Dialog
            open={isSettingsDialogOpen}
            onOpenChange={setIsSettingsDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                {selectedAssistantDetails.id === "" ? (
                  <>
                    <Settings className="w-3 h-3 mr-2 text-yellow-500 animate-bounce" />
                    Configure Me!
                  </>
                ) : (
                  <>
                    <Settings className="w-3 h-3 mr-2" />
                    Settings
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Chat Settings</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="model" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="model">Model</TabsTrigger>
                  <TabsTrigger value="assistant">
                    {selectedAssistantDetails.id === "" ? (
                      <span className="flex items-center">
                        Assistant{" "}
                        <span className="text-yellow-500 ml-1">⚠️</span>
                      </span>
                    ) : (
                      "Assistant"
                    )}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="model">
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshModelsAndAssistants}
                      disabled={loadingModelsAndAssistants}
                    >
                      <RefreshCw
                        className={cn(
                          "w-3 h-3 mr-1",
                          loadingModelsAndAssistants && "animate-spin"
                        )}
                      />
                      Refresh
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    {loadingModelsAndAssistants ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-sm text-muted-foreground">
                          Loading models...
                        </span>
                      </div>
                    ) : (
                      models.map((model) => (
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
                      ))
                    )}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="assistant">
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshModelsAndAssistants}
                      disabled={loadingModelsAndAssistants}
                    >
                      <RefreshCw
                        className={cn(
                          "w-3 h-3 mr-1",
                          loadingModelsAndAssistants && "animate-spin"
                        )}
                      />
                      Refresh
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    {loadingModelsAndAssistants ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-sm text-muted-foreground">
                          Loading assistants...
                        </span>
                      </div>
                    ) : assistants.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                        <p>No assistants found</p>
                        <p className="text-sm mt-2">
                          Create your first assistant in the OpenAI Playground
                        </p>
                        <a
                          href="https://platform.openai.com/playground/assistants"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-2"
                        >
                          Go to OpenAI Playground →
                        </a>
                      </div>
                    ) : (
                      assistants.map((assistant) => (
                        <div
                          key={assistant.id}
                          className={cn(
                            "flex items-center space-x-2 rounded-lg p-2 hover:bg-accent cursor-pointer",
                            tempSelectedAssistant === assistant.id &&
                              "bg-accent"
                          )}
                          onClick={() => setTempSelectedAssistant(assistant.id)}
                        >
                          <Bot className="w-4 h-4" />
                          <span>
                            {assistant.name ||
                              `No name given (id: ${assistant.id})`}
                          </span>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              <DialogFooter className="gap-2">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsContextDialogOpen(true)}
                >
                  <Paperclip className="w-3 h-3 mr-2" />
                  Add Context
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add files or source code as context</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isAssistantTyping ? (
          <Button
            onClick={handleCancelRun}
            size="sm"
            className="bg-destructive hover:bg-destructive/90"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        ) : (
          <Button
            onClick={handleSendMessage}
            disabled={isSendDisabled}
            size="sm"
            className={cn(!message.trim() && "opacity-50")}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send
          </Button>
        )}
      </div>
      <Dialog open={isContextDialogOpen} onOpenChange={setIsContextDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Context</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Selected files will be uploaded to OpenAI and used to provide more
            context to the assistant's answer.
            <a
              href="https://platform.openai.com/docs/guides/file-uploads"
              className="ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </p>
          <Tabs defaultValue="files" className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="sourceCode">Source Code</TabsTrigger>
            </TabsList>
            <TabsContent value="files">
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
            </TabsContent>
            <TabsContent value="sourceCode">
              <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <FolderTree className="w-16 h-16 text-primary" />
                <p className="text-center text-sm text-muted-foreground">
                  Add your entire source code as context for the AI assistant.
                </p>
                <Button onClick={handleAddSourceCode} className="w-full">
                  <FileCode2 className="w-4 h-4 mr-2" />
                  Add Source Code
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
