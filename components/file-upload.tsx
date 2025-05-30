"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Paperclip, X, File, ImageIcon, FileText, Film, Music, Archive, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>
  className?: string
}

export function FileUpload({ onFileUpload, className }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 5
      })
    }, 100)

    try {
      await onFileUpload(selectedFile)
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
        setSelectedFile(null)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      clearInterval(interval)
    }
  }

  const cancelUpload = () => {
    setSelectedFile(null)
    setIsUploading(false)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = (file: File) => {
    const type = file.type.split("/")[0]
    switch (type) {
      case "image":
        return <ImageIcon size={16} />
      case "video":
        return <Film size={16} />
      case "audio":
        return <Music size={16} />
      case "application":
        if (file.type.includes("pdf")) return <FileText size={16} />
        if (file.type.includes("zip") || file.type.includes("rar")) return <Archive size={16} />
        return <File size={16} />
      default:
        return <File size={16} />
    }
  }

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,text/*,video/*,audio/*"
      />

      {!selectedFile ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={18} />
        </Button>
      ) : isUploading ? (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-md p-1 pr-2">
          {getFileIcon(selectedFile)}
          <div className="flex-1 max-w-[100px]">
            <div className="text-xs truncate">{selectedFile.name}</div>
            <Progress value={uploadProgress} className="h-1 w-full" />
          </div>
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={cancelUpload}>
            <X size={12} />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-md p-1 pr-2">
          {getFileIcon(selectedFile)}
          <div className="text-xs truncate max-w-[80px]">{selectedFile.name}</div>
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={cancelUpload}>
            <X size={12} />
          </Button>
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-blue-500" onClick={handleUpload}>
            <Upload size={12} />
          </Button>
        </div>
      )}
    </div>
  )
}
