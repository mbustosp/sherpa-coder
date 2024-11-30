import * as React from "react"
import { Card, CardContent } from "@/webview/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/webview/components/ui/tabs"
import { useGlobalContext } from "../providers/globalStateContext"
import { Header } from "./header"
import { AccountTab } from "./accountTab"
import { ChatTab } from "./chatTab"
import LoadingOverlay from "./accountLoadingOverlay"

export default function Main() {
  const {
    isClientInitialized,
    openAIClientStatus,
    selectedAccountId,
    dismissOpenAIClientStatus,
    sendMessageToExtension
  } = useGlobalContext()

  const getLoadingState = () => {
    switch (openAIClientStatus.status) {
      case 'connecting':
        return 'connecting'
      case 'retrievingAssistants':
        return 'loadingAssistants'
      case 'retrievingModels':
        return 'loadingModels'
      case 'done':
        return 'ready'
      default:
        return 'connecting'
    }
  }

  const handleRetry = () => {
    if (selectedAccountId) {
      sendMessageToExtension("selectAccount", { accountId: selectedAccountId })
    }
  }

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
      <LoadingOverlay
        isVisible={openAIClientStatus.status !== 'idle' && openAIClientStatus.status !== 'done'}
        loadingState={getLoadingState()}
        onRetry={handleRetry}
        onClose={() => dismissOpenAIClientStatus()}
        error={openAIClientStatus.error || null}
      />
    </Card>
  )
}