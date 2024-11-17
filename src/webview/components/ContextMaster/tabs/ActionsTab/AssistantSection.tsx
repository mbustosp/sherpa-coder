import { HelpCircle } from 'lucide-react'
import React from "react";

interface AssistantSectionProps {
  selectedAssistant: string;
  selectedModel: string;
  assistants: string[];
  models: string[];
  onAssistantChange: (value: string) => void;
  onModelChange: (value: string) => void;
}

export function AssistantSection({
  selectedAssistant,
  selectedModel,
  assistants,
  models,
  onAssistantChange,
  onModelChange
}: AssistantSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-semibold">Assistant</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Select the AI assistant for this conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={selectedAssistant} onValueChange={onAssistantChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Assistant" />
          </SelectTrigger>
          <SelectContent>
            {assistants?.map((assistant) => (
              <SelectItem key={assistant} value={assistant}>{assistant}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-semibold">Model</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose the AI model for processing</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {models?.map((model) => (
              <SelectItem key={model} value={model}>{model}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
