import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContextMasterContext } from "./context"
import { Header } from "./Header"
import { AccountTab } from "./tabs/AccountTab"
import { ChatTab } from "./tabs/ChatTab"

export default function ContextMaster() {
  const {
    isClientInitialized,
  } = useContextMasterContext()

  return (

    <Card className={`flex flex-col w-full mx-auto transition-all duration-300 ease-in-out fixed inset-0 z-50 m-0 max-w-none rounded-none h-screen'}`}>
      <Header className="px-6 pt-4 pb-0" />
      <CardContent className="flex grow flex-auto overflow-y-hidden p-4">
        <Tabs defaultValue={isClientInitialized ? "chat" : "account"} className="flex flex-col flex-auto w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" disabled={!isClientInitialized}>Chat</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex flex-col overflow-y-hidden">
            <ChatTab />
          </TabsContent>
          
          <TabsContent value="account" className="flex flex-col">
            <AccountTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}