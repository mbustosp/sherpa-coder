import { Button } from "@/components/ui/button"
import { FileUp, Upload } from 'lucide-react'
import { sendMessage } from "../../../../vscode"
import React from "react";

interface DocumentationSectionProps {
  isUploading: boolean;
  uploadProgress: number;
  docsGenerated: boolean;
  onGenerateDocs: () => void;
  onUpload: () => void;
  disabled?: boolean;
}

export function DocumentationSection({
  isUploading,
  uploadProgress,
  docsGenerated,
  onGenerateDocs,
  onUpload,
  disabled = false
}: DocumentationSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Project Documentation</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Generate and upload project documentation to enhance the assistant's knowledge.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Generate Docs</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Creates a markdown file with the project source code, excluding files in .gitignore.
          </p>
          <Button onClick={onGenerateDocs} disabled={disabled}>
            <FileUp className="w-4 h-4 mr-2" />
            Generate Docs
          </Button>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2">Upload to Assistant</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Uploads the generated documentation to the current assistant's vector store.
          </p>
          <Button 
            onClick={onUpload} 
            disabled={!docsGenerated || isUploading || disabled}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload to Assistant
          </Button>
        </div>
      </div>
      {isUploading && (
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-4">
          <div
            className="bg-primary h-full transition-all duration-500 ease-out"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  )
}