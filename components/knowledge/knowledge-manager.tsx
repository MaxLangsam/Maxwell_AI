"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "./file-upload"
import { Search, File, Trash2, Eye, Calendar, FileText, Database } from "lucide-react"
import { cn } from "@/lib/utils"

interface KnowledgeFile {
  id: string
  filename: string
  original_name: string
  file_type: string
  file_size: number
  summary: string
  tags: string[]
  status: string
  created_at: string
}

export function KnowledgeManager() {
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(null)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch("/api/knowledge/files")
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error("Error loading files:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/knowledge/files/${fileId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId))
        if (selectedFile?.id === fileId) {
          setSelectedFile(null)
        }
      }
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const filteredFiles = files.filter(
    (file) =>
      file.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("word") || fileType.includes("doc")) return "📝"
    if (fileType.includes("text")) return "📃"
    if (fileType.includes("csv")) return "📊"
    return "📁"
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <FileUpload onFileUploaded={loadFiles} />

      {/* Knowledge Base Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{files.length}</div>
              <div className="text-sm text-gray-500">Total Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {files.filter((f) => f.status === "ready").length}
              </div>
              <div className="text-sm text-gray-500">Ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {files.reduce((acc, f) => acc + f.file_size, 0) / 1024 / 1024 < 1
                  ? `${(files.reduce((acc, f) => acc + f.file_size, 0) / 1024).toFixed(1)} KB`
                  : `${(files.reduce((acc, f) => acc + f.file_size, 0) / 1024 / 1024).toFixed(1)} MB`}
              </div>
              <div className="text-sm text-gray-500">Total Size</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Files List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">{searchQuery ? "No files match your search" : "No files uploaded yet"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                    selectedFile?.id === file.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50",
                  )}
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{file.original_name}</p>
                      <Badge
                        variant={file.status === "ready" ? "default" : "secondary"}
                        className={
                          file.status === "ready"
                            ? "bg-green-100 text-green-800"
                            : file.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {file.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatFileSize(file.file_size)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {file.summary && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{file.summary}</p>}
                    {file.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {file.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{file.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(file)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFile(file.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Details */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              File Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">File Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{selectedFile.original_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <p className="font-medium">{formatFileSize(selectedFile.file_size)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium">{selectedFile.file_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={selectedFile.status === "ready" ? "default" : "secondary"}>
                      {selectedFile.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedFile.summary && (
                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedFile.summary}</p>
                </div>
              )}

              {selectedFile.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFile.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
