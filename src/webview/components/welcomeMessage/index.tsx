import * as React from "react"
import { ChevronUp } from 'lucide-react'
import { Card, CardContent } from "@/webview/components/ui/card"

export function WelcomeMessage() {
  return (
    <Card className="w-full mx-auto bg-card">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <ChevronUp className="h-6 w-6 text-primary animate-bounce" />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-semibold mb-2">🚀 Getting Started</h3>
            <p className="text-sm">
              To begin, click on <span className="font-semibold px-1 text-primary rounded">Select Conversation</span> above. You can create a new conversation or choose an existing one to start chatting.
            </p>
            <p className="text-sm mt-2">
              These are your locally stored conversations. They're just for you!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}