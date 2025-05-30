"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "ready" | "error"
  progress: number
  error?: string
}

interface FileUploadProps {
  onFileUploaded?: (file: any) => void
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading" as const,
        progress: 0,
      }))

      setFiles((prev) => [...prev, ...newFiles])

      // Process each file
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        const fileId = newFiles[i].id

        try {
          // Update progress
          setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 25 } : f)))

          // Create FormData
          const formData = new FormData()
          formData.append("file", file)

          // Upload file
          const response = await fetch("/api/knowledge/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Upload failed")
          }

          const result = await response.json()

          // Update status to processing
          setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 50 } : f)))

          // Poll for processing completion
          let attempts = 0
          const maxAttempts = 30 // 30 seconds max

          while (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const statusResponse = await fetch(`/api/knowledge/status/${result.fileId}`)
            const statusData = await statusResponse.json()

            if (statusData.status === "ready") {
              setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "ready", progress: 100 } : f)))
              onFileUploaded?.(statusData)
              break
            } else if (statusData.status === "error") {
              throw new Error(statusData.error || "Processing failed")
            }

            // Update progress
            const progress = Math.min(50 + attempts * 2, 90)
            setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))

            attempts++
          }

          if (attempts >= maxAttempts) {
            throw new Error("Processing timeout")
          }
        } catch (error) {
          console.error("Upload error:", error)
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    status: "error",
                    error: error instanceof Error ? error.message : "Upload failed",
                  }
                : f,
            ),
          )
        }
      }
    },
    [onFileUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/markdown": [".md"],
      "text/csv": [".csv"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Knowledge Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-1">Drag & drop files here, or click to select</p>
              <p className="text-sm text-gray-400">Supports: PDF, DOC, DOCX, TXT, MD, CSV (max 10MB)</p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Uploaded Files</h4>
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <File className="h-4 w-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <Badge variant="secondary" className={getStatusColor(file.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(file.status)}
                        {file.status}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  {(file.status === "uploading" || file.status === "processing") && (
                    <Progress value={file.progress} className="mt-2 h-1" />
                  )}
                  {file.error && <p className="text-xs text-red-500 mt-1">{file.error}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
