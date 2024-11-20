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
    ...contextState
  } = useContextMasterContext()

  return (

    <Card className={`w-full mx-auto transition-all duration-300 ease-in-out fixed inset-0 z-50 m-0 max-w-none rounded-none'}`}>
      <Header isFullScreen={isFullScreen} onToggleFullScreen={toggleFullScreen} />
      <CardContent>
        <Tabs defaultValue={isClientInitialized ? "chat" : "account"} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" disabled={!isClientInitialized}>Chat</TabsTrigger>
            <TabsTrigger value="actions" disabled={!isClientInitialized}>Actions</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <ChatTab />
          </TabsContent>
          
          <TabsContent value="actions">
            <ActionsTab />
          </TabsContent>
          
          <TabsContent value="account">
            <AccountTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}