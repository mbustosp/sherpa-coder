import { useContextMasterContext } from "../../context"
import { AccountSelector } from "./AccountSelector"
import { AccountCreator } from "./AccountCreator"
import React from "react"
import { Separator } from "../../../ui/separator"

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
    handleDeleteAccount
  } = useContextMasterContext()

  return (
    <div className="space-y-6">
      <AccountSelector 
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onAccountChange={setSelectedAccountId}
        onDeleteAccount={handleDeleteAccount}
      />
      <Separator />
      <AccountCreator 
        newAccountName={newAccountName}
        newAccountApiKey={newAccountApiKey}
        onNameChange={setNewAccountName}
        onApiKeyChange={setNewAccountApiKey}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  )
}
