import React, { useEffect } from "react"
import { useContextMasterContext } from "../../context"
import { AssistantSection } from "./AssistantSection"
import { DocumentationSection } from "./DocumentationSection"
import { Separator } from "../../../ui/separator"


export function ActionsTab() {
  const {
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
    isGeneratingDocs,
    assistants,
    models,
    dismissDocsGenerated,
    generatedDocsInfo, // Added property
    error, // Added property
    dismissError, // Added property
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
        isGeneratingDocs={isGeneratingDocs}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        docsGenerated={docsGenerated}
        onGenerateDocs={handleGenerateDocs}
        onUpload={handleUpload}
        disabled={!isClientInitialized}
        generatedDocsInfo={generatedDocsInfo} // Added property
        error={error} // Added property
        onDismissError={dismissError} // Added property
      />
    </div>
  )
}