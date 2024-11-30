import { Trash2 } from "lucide-react";
import { Account } from "../../../types";
import React from "react";
import { Button } from "@/webview/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/webview/components/ui/select";

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onAccountChange: (accountId: string) => void;
  onDeleteAccount: (accountId: string) => void;
  disabled?: boolean;
}

export function AccountSelector({
  accounts,
  selectedAccountId,
  onAccountChange,
  onDeleteAccount,
  disabled = false,
}: AccountSelectorProps) {
  const hasAccounts = accounts.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2">Select Existing Account</h4>
        {hasAccounts ? (
          <Select
            value={selectedAccountId || ""}
            onValueChange={onAccountChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-muted-foreground p-2 border rounded-md">
            No accounts available. Please add an account to get started.
          </div>
        )}
      </div>
      <Button
        variant="secondary"
        disabled={!selectedAccountId || disabled}
        onClick={() => selectedAccountId && onDeleteAccount(selectedAccountId)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Selected Account
      </Button>
    </div>
  );
}
