import * as React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileUp, Upload, Check, AlertCircle, Loader2, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Progress } from "@/webview/components/ui/progress"

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'

interface DocumentationSectionProps {
  isGeneratingDocs: boolean
  isUploading: boolean
  uploadProgress: number
  docsGenerated: boolean
  onGenerateDocs: () => void
  onUpload: () => void
  disabled: boolean
  generatedDocsInfo: {
    path: string
    filename: string
    size: number
    success: boolean
  } | null
  error: string | null
  onDismissError: () => void
}

export function DocumentationSection({
  isGeneratingDocs,
  isUploading,
  uploadProgress,
  docsGenerated,
  onGenerateDocs,
  onUpload,
  disabled,
  generatedDocsInfo,
  error,
  onDismissError
}: DocumentationSectionProps) {
  const file = {
    name: generatedDocsInfo?.filename || 'project-documentation.md',
    size: generatedDocsInfo ? `${generatedDocsInfo.size} bytes` : '0 KB',
    status: error ? 'error' as UploadStatus : 
            isUploading ? 'uploading' as UploadStatus : 
            (uploadProgress === 100 ? 'success' as UploadStatus : 'pending' as UploadStatus),
    progress: uploadProgress
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Project Documentation</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Generate and upload project documentation to enhance the assistant's knowledge.
      </p>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h4 className="text-sm font-semibold mb-1">Generate Docs</h4>
            <p className="text-xs text-muted-foreground">
              Creates a markdown file with the project source code, excluding files in .gitignore.
            </p>
          </div>
          <Button 
            onClick={onGenerateDocs} 
            disabled={disabled || isGeneratingDocs || isUploading}
            className="w-full sm:w-auto"
          >
            {isGeneratingDocs ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileUp className="w-4 h-4 mr-2" />
            )}
            {isGeneratingDocs ? 'Generating...' : 'Generate Docs'}
          </Button>
        </div>

        {docsGenerated && (
          <div className="space-y-4">
            <Separator />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h4 className="text-sm font-semibold mb-1">Upload to Assistant</h4>
                <p className="text-xs text-muted-foreground">
                  Uploads the generated documentation to the current assistant's vector store.
                </p>
              </div>
              <Button 
                onClick={onUpload} 
                disabled={disabled || isUploading || file.status === 'success'}
                className="w-full sm:w-auto"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{file.name}</p>
                  <span className="text-xs text-muted-foreground">{file.size}</span>
                </div>
                {isUploading && <Progress value={file.progress} className="h-2" />}
              </div>
              <div className="flex items-center justify-center w-8 h-8">
                {!isUploading && !error && !file.status === 'success' && <FileUp className="w-4 h-4 text-muted-foreground" />}
                {isUploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                {file.status === 'success' && <Check className="w-4 h-4 text-green-500" />}
                {error && <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>
            </div>

            {error ? (
              <p className="text-sm text-red-500 text-center flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </p>
            ) : (
              <p className={cn(
                "text-sm text-center",
                file.status === 'success' ? "text-green-500" : "text-muted-foreground"
              )}>
                {file.status === 'success' ? (
                  <span className="flex items-center justify-center">
                    <Check className="w-4 h-4 mr-2" />
                    File uploaded successfully
                  </span>
                ) : (
                  isUploading ? "Uploading file to the assistant's vector store..." : "Ready to upload"
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}