import React, { useRef, useEffect, useState } from "react";
import { Message } from "@/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, Copy, Check, ChevronDown } from 'lucide-react';
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { useTheme } from "@/ThemeProvider";

interface ChatWindowProps {
  messages: Message[];
  error?: string;
  isAssistantTyping?: boolean;
  autoScroll?: boolean;
}

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
  error,
  isAssistantTyping,
  autoScroll = true,
}: ChatWindowProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const { theme } = useTheme();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  return (
    <div className="border rounded-md py-2 flex flex-col flex-auto overflow-y-hidden">
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
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`w-full max-w-3xl ${
                  message.sender === "user" ? "" : ""
                } relative`}>
                  <div className={`rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                    <div className="relative">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-0 right-0 p-1 h-6 w-6"
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
                      <Markdown
                        className="text-sm [&>p]:py-2 [&>.math-display]:text-center pr-6"
                        remarkPlugins={[remarkMath]}
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
                                  style={theme === 'dark' ? oneDark : oneLight}
                                />
                              </div>
                            ) : (
                              <code {...rest} className={className}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {processMessageContent(message.content)}
                      </Markdown>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span>{new Date(message.timestamp).toLocaleString()}</span>
                      <span className="font-semibold">
                        {message.sender === "user" ? "You" : "Assistant"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {isAssistantTyping && (
          <div className="text-muted-foreground mt-2">
            Assistant is typing...
            <button className="ml-2 text-primary">Cancel</button>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="relative">
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
            <TooltipContent>
              Scroll to Bottom
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
