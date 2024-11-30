
import React from "react";

import { cn } from '@/webview/lib/cn';
import { CardHeader, CardDescription } from "../ui/card";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <CardHeader className={cn('flex-initial', className)}>
      <div className="flex items-center justify-between">
        <div>
          <CardDescription className="">
            Sherpa Coder is an extension that allows you to use the power of OpenAI assistants in VSCode.
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}
