
import { Trash2 } from 'lucide-react'
import { Account } from "../../../../types"
import React from "react";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onAccountChange: (accountId: string) => void;
  onDeleteAccount: () => void;
}

export function AccountSelector({
  accounts,
  selectedAccountId,
  onAccountChange,
  onDeleteAccount
}: AccountSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2">Select Existing Account</h4>
        <Select value={selectedAccountId || ''} onValueChange={onAccountChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button 
        variant="secondary" 
        disabled={!selectedAccountId} 
        onClick={onDeleteAccount}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Selected Account
      </Button>
    </div>
  )
}
