
import React from "react";
import { CardHeader, CardTitle, CardDescription } from '../ui/card';
import { cn } from '@/lib/utils';

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
