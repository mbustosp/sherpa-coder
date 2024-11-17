
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ExternalLink } from 'lucide-react'
import React from "react";

interface AccountCreatorProps {
  newAccountName: string;
  newAccountApiKey: string;
  onNameChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onCreateAccount: () => void;
}

export function AccountCreator({
  newAccountName,
  newAccountApiKey,
  onNameChange,
  onApiKeyChange,
  onCreateAccount
}: AccountCreatorProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold mb-2">Create New Account</h4>
      <Input 
        placeholder="New Account Name" 
        value={newAccountName}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <div>
        <Input 
          type="password" 
          placeholder="OpenAI API Key" 
          value={newAccountApiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          You can obtain your OpenAI API key from the{" "}
          <a 
            href="https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center"
          >
            OpenAI dashboard
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </p>
      </div>
      <Button onClick={onCreateAccount}>
        <Plus className="w-4 h-4 mr-2" />
        Create New Account
      </Button>
    </div>
  )
}
