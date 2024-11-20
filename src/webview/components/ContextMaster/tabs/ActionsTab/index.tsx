import React from "react"
import { useContextMasterContext } from "../../context"
import { AssistantSection } from "./AssistantSection"
import { DocumentationSection } from "./DocumentationSection"
import { Separator } from "../../../ui/separator"


export function ActionsTab() {
  const {
    selectedAccount,
    selectedAssistant,
    selectedModel,
    setSelectedAssistant,
    setSelectedModel,
    isUploading,
    uploadProgress,
    docsGenerated,
    handleUpload,
    handleGenerateDocs,
    isClientInitialized,
    assistants,
    models,
  } = useContextMasterContext()

  return (
    <div className="space-y-6">
      <AssistantSection 
        selectedAssistant={selectedAssistant}
        selectedModel={selectedModel}
        assistants={assistants || []}
        models={models || []}
        onAssistantChange={setSelectedAssistant}
        onModelChange={setSelectedModel}
        disabled={!isClientInitialized}
      />
      <Separator />
      <DocumentationSection 
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        docsGenerated={docsGenerated}
        onGenerateDocs={handleGenerateDocs}
        onUpload={handleUpload}
        disabled={!isClientInitialized}
      />
    </div>
  )
}
