import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "@/types";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

interface ChatWindowProps {
  messages: Message[];
  error?: string;
  isAssistantTyping?: boolean;
}

const processMessageContent = (content: string): string => {
  // First escape any existing $ symbols
  let replacedContent = content.replace(/\\\$/g, "\\dollar");

  // Replace inline math delimiters \( \) with $ $
  replacedContent = replacedContent.replace(/\\\(\s*/g, "$");
  replacedContent = replacedContent.replace(/\s*\\\)/g, "$");

  // Replace block math delimiters \[ \] with $ $ and proper spacing
  replacedContent = replacedContent.replace(/\\\[\s*/g, "\n\n$\n");
  replacedContent = replacedContent.replace(/\s*\\\]/g, "\n$\n\n");

  // Restore escaped $ symbols
  replacedContent = replacedContent.replace(/\\dollar/g, "\\$");

  return replacedContent;
};
export function ChatWindow({
  messages,
  error,
  isAssistantTyping,
}: ChatWindowProps) {
  return (
    <div className="border rounded-md p-4 h-80 overflow-y-auto">
      <div className="chat">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[70%] ${
                  message.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={
                      message.sender === "user"
                        ? "/placeholder-user.jpg"
                        : "/placeholder-assistant.jpg"
                    }
                  />
                  <AvatarFallback>
                    {message.sender === "user" ? "U" : "A"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-3 w-full ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <Markdown
                    className="text-sm [&>p]:py-2 [&>.math-display]:text-center"
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code(props) {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                          <SyntaxHighlighter
                            {...rest}
                            PreTag="div"
                            children={String(children).replace(/\n$/, "")}
                            language={match[1]}
                            style={dark}
                          />
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {error && <div className="chat__error">{error}</div>}
        {isAssistantTyping && (
          <div className="chat__typing">
            Assistant is typing...
            <button className="chat__cancel-btn">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
