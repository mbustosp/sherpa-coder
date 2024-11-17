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
    ...contextState
  } = useContextMasterContext()

  return (
    <Card className={`w-full mx-auto transition-all duration-300 ease-in-out ${isFullScreen ? 'fixed inset-0 z-50 m-0 max-w-none rounded-none' : 'max-w-3xl'}`}>
      <Header isFullScreen={isFullScreen} onToggleFullScreen={toggleFullScreen} />
      <CardContent>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" disabled={!selectedAccount}>Chat</TabsTrigger>
            <TabsTrigger value="actions" disabled={!selectedAccount}>Actions</TabsTrigger>
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
