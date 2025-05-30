"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Paperclip, X, File, ImageIcon, FileText, Film, Music, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface FileUploadProps {
  onFileUpload: (file: File) => void
}

interface UploadedFile {
  id: string
  file: File
  progress: number
  status: "uploading" | "complete" | "error"
  previewUrl?: string
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const fileId = `file-${Date.now()}`

    // Create a preview URL for images
    let previewUrl: string | undefined
    if (file.type.startsWith("image/")) {
      previewUrl = URL.createObjectURL(file)
    }

    // Add file to uploaded files list
    setUploadedFiles((prev) => [
      ...prev,
      {
        id: fileId,
        file,
        progress: 0,
        status: "uploading",
        previewUrl,
      },
    ])

    // Simulate upload progress
    setIsUploading(true)
    simulateUpload(fileId, file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const simulateUpload = (fileId: string, file: File) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))

      if (progress >= 100) {
        clearInterval(interval)
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "complete" } : f)))
        setIsUploading(false)
        onFileUpload(file)
      }
    }, 300)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== fileId)
      // If no files are left, reset uploading state
      if (updatedFiles.length === 0) {
        setIsUploading(false)
      }
      return updatedFiles
    })
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith("image/")) return <ImageIcon size={16} />
    if (type.startsWith("text/")) return <FileText size={16} />
    if (type.startsWith("video/")) return <Film size={16} />
    if (type.startsWith("audio/")) return <Music size={16} />
    if (type.includes("zip") || type.includes("compressed")) return <Archive size={16} />
    return <File size={16} />
  }

  return (
    <TooltipProvider>
      <div className="relative flex items-center justify-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Paperclip size={16} />
              <span className="sr-only">Attach file</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Attach file</TooltipContent>
        </Tooltip>

        {uploadedFiles.length > 0 && (
          <div className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-2 space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8">
                  {uploadedFile.previewUrl ? (
                    <img
                      src={uploadedFile.previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      {getFileIcon(uploadedFile.file)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{uploadedFile.file.name}</p>
                  {uploadedFile.status === "uploading" && (
                    <Progress value={uploadedFile.progress} className="h-1 mt-1" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 rounded-full"
                  onClick={() => removeFile(uploadedFile.id)}
                >
                  <X size={12} />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
