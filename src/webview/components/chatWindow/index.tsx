import React, { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/webview/components/ui/button";
import { Badge } from "@/webview/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/webview/components/ui/tooltip";
import {
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  Paperclip,
  FileIcon,
  User,
  Bot,
} from "lucide-react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from 'remark-gfm';
import { Message } from "src/types";
import { useTheme } from "@/webview/providers/themeProvider";

interface ChatWindowProps {
  messages: Message[];
  isAssistantTyping?: boolean;
  autoScroll?: boolean;
  onFileClick: (filePath: string) => void; 
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

const processMessageContent = (content: string): string => {
  let replacedContent = content.replace(/\\\$/g, "\\dollar");
  replacedContent = replacedContent.replace(/\\\(\s*/g, "$");
  replacedContent = replacedContent.replace(/\s*\\\)/g, "$");
  replacedContent = replacedContent.replace(/\\\[\s*/g, "\n\n$\n");
  replacedContent = replacedContent.replace(/\s*\\\]/g, "\n$\n\n");
  replacedContent = replacedContent.replace(/\\dollar/g, "\\$");
  return replacedContent;
};

export function ChatWindow({
  messages = [],
  isAssistantTyping = false,
  autoScroll = true,
  onFileClick
}: ChatWindowProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [windowSize] = useState(5);
  const [currentWindowStart, setCurrentWindowStart] = useState(
    Math.max(0, messages.length - windowSize)
  );
  const { theme } = useTheme();

  const visibleMessages = useMemo(() => {
    return messages.slice(currentWindowStart, currentWindowStart + windowSize);
  }, [messages, currentWindowStart, windowSize]);

  useEffect(() => {
    setCurrentWindowStart(Math.max(0, messages.length - windowSize));
  }, [messages, windowSize]);

  const canMoveNext = currentWindowStart + windowSize < messages.length && !isAssistantTyping;
  const canMovePrev = currentWindowStart > 0 && !isAssistantTyping;

  const moveNext = () => {
    if (canMoveNext) {
      setCurrentWindowStart((prev) => prev + 1);
    }
  };

  const movePrev = () => {
    if (canMovePrev) {
      setCurrentWindowStart((prev) => Math.max(0, prev - 1));
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll, messages[messages.length - 1]?.content]);

  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  return (
    <div className="rounded-md py-2 flex flex-col flex-auto overflow-y-hidden">
      {messages.length > windowSize && (
        <div className="flex justify-between items-center px-4 mb-2">
          <Button
            onClick={() => setCurrentWindowStart(0)}
            disabled={!canMovePrev}
            variant="outline"
            size="icon"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={movePrev}
            disabled={!canMovePrev}
            variant="outline"
            size="icon"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentWindowStart + 1} - {currentWindowStart + visibleMessages.length} of {messages.length}
          </span>
          <Button
            onClick={moveNext}
            disabled={!canMoveNext}
            variant="outline"
            size="icon"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setCurrentWindowStart(Math.max(0, messages.length - windowSize))}
            disabled={!canMoveNext}
            variant="outline"
            size="icon"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex-grow overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageSquare className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                Welcome to Sherpa Coder Chat! 👋
              </h2>
              <p className="text-muted-foreground mb-4">
                Your AI-powered coding assistant is ready to help.
              </p>
              <p className="text-lg font-medium mb-2">
                💬 Send a message to start the conversation
              </p>
              <p className="text-sm text-muted-foreground">
                Ask questions, get explanations, or request code samples!
              </p>
            </div>
          ) : (
            visibleMessages.map((message, index) => (
              <div
                key={message.id}
                className={`flex w-full ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="px-4 w-full max-w-3xl relative">
                  <div className="rounded-lg p-3 bg-secondary text-secondary-foreground">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <div className="flex items-center space-x-2">
                        {message.sender === "user" ? (
                          <User className="h-5 w-5 text-blue-500" />
                        ) : message.sender === "system" ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Bot className="h-5 w-5 text-green-500" />
                        )}
                        <span className="font-semibold text-sm">
                          {message.sender === "user" ? "You" : message.sender === "system" ? "System" : message.assistantName}
                        </span>
                        {message.sender === "assistant" && (
                          <Badge variant="secondary" className="text-xs">
                            {message.modelName}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          #{currentWindowStart + index + 1}
                        </Badge>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0"
                                onClick={() => handleCopyMessage(message.id, message.content)}
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {copiedMessageId === message.id ? "Copied!" : "Copy message"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <Markdown
                      className="text-sm [&>p]:py-2 [&>.math-display]:text-center"
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code(props) {
                          const { children, className, node, ...rest } = props;
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <div className="relative">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-2 right-2 z-10"
                                      onClick={() => handleCopyMessage(message.id, String(children))}
                                    >
                                      {copiedMessageId === message.id ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {copiedMessageId === message.id ? "Copied!" : "Copy code"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <SyntaxHighlighter
                                {...rest}
                                PreTag="div"
                                children={String(children).replace(/\n$/, "")}
                                language={match[1]}
                                style={theme === "dark" ? oneDark : oneLight}
                              />
                            </div>
                          ) : (
                            <code {...rest} className={className}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {processMessageContent(message.content)}
                    </Markdown>

                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-4 p-2 rounded-md">
                        <h4 className="text-sm font-semibold mb-2 flex items-center">
                          <Paperclip className="h-4 w-4 mr-2" />
                          Attachments
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {message.attachments.map((attachment, index) => (
                            <TooltipProvider key={index}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      onFileClick(attachment.path);
                                    }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-2 bg-background rounded-md hover:bg-background/10"
                                  >
                                    <div className="flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center mr-3">
                                      <FileIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                      <p className="text-sm font-semibold truncate">{attachment.fileName}</p>
                                      <p className="text-xs truncate">{attachment.path}</p>
                                    </div>
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>Click to open attachment</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {isAssistantTyping && (
          <div className="text-muted-foreground ml-4 mt-2">
            Assistant is typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="relative right-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0"
                onClick={scrollToBottom}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Scroll to Bottom</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
