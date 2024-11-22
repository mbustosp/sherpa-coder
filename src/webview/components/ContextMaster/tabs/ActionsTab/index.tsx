import React from "react"
import { useContextMasterContext } from "../../context"
import { DocumentationSection } from "./DocumentationSection"

export function ActionsTab() {
  const {
    isUploading,
    uploadProgress,
    docsGenerated,
    handleUpload,
    handleGenerateDocs,
    isClientInitialized,
    isGeneratingDocs,
    generatedDocsInfo,
    error,
    dismissError,
  } = useContextMasterContext()

  return (
    <div className="space-y-6">
      <DocumentationSection 
        isGeneratingDocs={isGeneratingDocs}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        docsGenerated={docsGenerated}
        onGenerateDocs={handleGenerateDocs}
        onUpload={handleUpload}
        disabled={!isClientInitialized}
        generatedDocsInfo={generatedDocsInfo}
        error={error}
        onDismissError={dismissError}
      />
    </div>
  )
}