import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContextMasterContext } from "./context"
import { Header } from "./Header"
import { AccountTab } from "./tabs/AccountTab"
import { ActionsTab } from "./tabs/ActionsTab"
import { ChatTab } from "./tabs/ChatTab"

export default function ContextMaster() {
  const {
    isFullScreen,
    selectedAccount,
    toggleFullScreen,
    error,
    isClientInitialized,
  } = useContextMasterContext()

  return (

    <Card className={`flex flex-col w-full mx-auto transition-all duration-300 ease-in-out fixed inset-0 z-50 m-0 max-w-none rounded-none'}`}>
      <Header isFullScreen={isFullScreen} onToggleFullScreen={toggleFullScreen} />
      <CardContent className="flex grow flex-auto overflow-y-hidden">
        <Tabs defaultValue={isClientInitialized ? "chat" : "account"} className="flex flex-col w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" disabled={!isClientInitialized}>Chat</TabsTrigger>
            <TabsTrigger value="actions" disabled={!isClientInitialized}>Actions</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex flex-col overflow-y-hidden">
            <ChatTab />
          </TabsContent>
          
          <TabsContent value="actions" className="flex flex-col">
            <ActionsTab />
          </TabsContent>
          
          <TabsContent value="account" className="flex flex-col">
            <AccountTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}