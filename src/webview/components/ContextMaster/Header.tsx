
import { Minimize2, Maximize2 } from 'lucide-react'
import React from "react";
import { Button } from '../ui/button';
import { CardHeader, CardTitle, CardDescription } from '../ui/card';

interface HeaderProps {
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export function Header({ isFullScreen, onToggleFullScreen }: HeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>ContextMaster Chat</CardTitle>
          <CardDescription className="mt-2">
            ContextMaster is an extension that allows you to use the power of OpenAI assistants in VSCode.
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}
