import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react'
import React from "react";

interface Assistant {
  id: string;
  object: string;
  created_at: number;
  name: string;
  description: string | null;
  model: string;
  instructions: string;
  tools: Array<{
      type: string;
      file_search?: {
          ranking_options: {
              ranker: string;
              score_threshold: number;
          };
      };
  }>;
  top_p: number;
  temperature: number;
  tool_resources: {
      file_search?: {
          vector_store_ids: string[];
      };
  };
  metadata: Record<string, any>;
  response_format: string | { type: string };
}

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface AssistantSectionProps {
  selectedAssistant: string;
  selectedModel: string;
  assistants: Assistant[];
  models: Model[];
  onAssistantChange: (value: string) => void;
  onModelChange: (value: string) => void;
  disabled?: boolean;
}

export function AssistantSection({
  selectedAssistant,
  selectedModel,
  assistants,
  models,
  onAssistantChange,
  onModelChange,
  disabled = false
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
        <Select value={selectedAssistant} onValueChange={onAssistantChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select Assistant" />
          </SelectTrigger>
          <SelectContent>
            {assistants?.map((assistant) => (
              <SelectItem key={assistant.id} value={assistant.id}>{assistant.name}</SelectItem>
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
        <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {models?.map((model) => (
              <SelectItem key={model.id} value={model.id}>{model.id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}