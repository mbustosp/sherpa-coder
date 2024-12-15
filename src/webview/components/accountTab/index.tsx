
import { AccountSelector } from "../accountSelector";
import { AccountCreator } from "../accountCreator";
import React from "react";
import { Separator } from "../ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/webview/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LocalDataEraser } from "../localDataEraser";
import { useGlobalContext } from "@/webview/providers/globalState/globalStateContext";

export function AccountTab() {
  const {
    accounts,
    selectedAccountId,
    newAccountName,
    newAccountApiKey,
    selectAccount,
    setNewAccountName,
    setNewAccountApiKey,
    handleCreateAccount,
    handleDeleteAccount,
    handleRemoveExtensionData,
    error,
    dismissError,
    isLoading
  } = useGlobalContext();

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
        onAccountChange={selectAccount}
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
      <Separator />
      <LocalDataEraser onRemoveData={handleRemoveExtensionData} />
    </div>
  );
}
