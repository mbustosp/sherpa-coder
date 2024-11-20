import { useContextMasterContext } from "../../context";
import { AccountSelector } from "./AccountSelector";
import { AccountCreator } from "./AccountCreator";
import React from "react";
import { Separator } from "../../../ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/webview/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function AccountTab() {
  const {
    accounts,
    selectedAccountId,
    newAccountName,
    newAccountApiKey,
    setSelectedAccountId,
    setNewAccountName,
    setNewAccountApiKey,
    handleCreateAccount,
    handleDeleteAccount,
    error,
    dismissError,
    isLoading
  } = useContextMasterContext();

  React.useEffect(() => {
      if (error) {
        const timer = setTimeout(() => {
          dismissError();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [error, dismissError]);
  

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <AccountSelector
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onAccountChange={setSelectedAccountId}
        onDeleteAccount={handleDeleteAccount}
        disabled={isLoading}
      />
      <Separator />
      <AccountCreator
        newAccountName={newAccountName}
        newAccountApiKey={newAccountApiKey}
        onNameChange={setNewAccountName}
        onApiKeyChange={setNewAccountApiKey}
        onCreateAccount={handleCreateAccount}
        disabled={isLoading}
      />
    </div>
  );
}
