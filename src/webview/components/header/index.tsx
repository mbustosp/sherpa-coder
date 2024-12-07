import React from "react";
import { cn } from "@/webview/lib/cn";
import { CardHeader, CardDescription } from "../ui/card";
import { useTheme } from "@/webview/providers/themeProvider";
import logoDark from "@/images/text/logo-dark.png";
import logoLight from "@/images/text/logo-light.png";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { theme } = useTheme();

  return (
    <CardHeader className={cn("flex-initial", className)}>
      <div className="flex items-center justify-between gap-4">
        <a
          href="https://www.sherpacoder.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="SherpaCoderDev Logo"
            className="h-8 w-auto"
          />
        </a>
        <CardDescription className="hidden sm:block text-sm">
          <a
            href="https://www.sherpacoder.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.sherpacoder.dev
          </a>
        </CardDescription>
      </div>
    </CardHeader>
  );
}