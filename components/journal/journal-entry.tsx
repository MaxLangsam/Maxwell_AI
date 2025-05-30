"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Save,
  Upload,
  X,
  type File,
  FileText,
  Plus,
  Calendar,
  Tag,
  Smile,
  Frown,
  Meh,
  Heart,
  Zap,
  Leaf,
  AlertTriangle,
  Sparkles,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface JournalEntryProps {
  entry?: {
    id: string
    title: string
    content: string
    mood?: string
    tags: string[]
    attachments: any[]
    created_at: string
  }
  onSave: (data: {
    title: string
    content: string
    mood?: string
    tags: string[]
  }) => Promise<void>
  onFileUpload: (file: File, onProgress: (progress: number) => void) => Promise<void>
  isNew?: boolean
}

const MOOD_OPTIONS = [
  { value: "happy", label: "Happy", icon: Smile, color: "text-yellow-500" },
  { value: "sad", label: "Sad", icon: Frown, color: "text-blue-500" },
  { value: "neutral", label: "Neutral", icon: Meh, color: "text-gray-500" },
  { value: "excited", label: "Excited", icon: Zap, color: "text-orange-500" },
  { value: "anxious", label: "Anxious", icon: AlertTriangle, color: "text-red-500" },
  { value: "calm", label: "Calm", icon: Leaf, color: "text-green-500" },
  { value: "frustrated", label: "Frustrated", icon: X, color: "text-red-600" },
  { value: "grateful", label: "Grateful", icon: Heart, color: "text-pink-500" },
]

const TAG_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-orange-100 text-orange-800",
  "bg-pink-100 text-pink-800",
  "bg-indigo-100 text-indigo-800",
  "bg-teal-100 text-teal-800",
  "bg-red-100 text-red-800",
]

export function JournalEntry({ entry, onSave, onFileUpload, isNew = false }: JournalEntryProps) {
  const [title, setTitle] = useState(entry?.title || "")
  const [content, setContent] = useState(entry?.content || "")
  const [mood, setMood] = useState(entry?.mood || "")
  const [tags, setTags] = useState<string[]>(entry?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return

    setIsSaving(true)
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        mood: mood || undefined,
        tags,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadProgress(0)
    try {
      await onFileUpload(file, (progress) => {
        setUploadProgress(progress)
      })
    } finally {
      setUploadProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const getTagColor = (index: number) => {
    return TAG_COLORS[index % TAG_COLORS.length]
  }

  const selectedMood = MOOD_OPTIONS.find((option) => option.value === mood)

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isNew ? "New Journal Entry" : "Edit Entry"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {entry && <span className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</span>}
            <Button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Title */}
        <div>
          <label className="text-sm font-medium mb-2 block">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind today?"
            className="text-lg"
          />
        </div>

        {/* Mood Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Mood (optional)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {MOOD_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={mood === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(mood === option.value ? "" : option.value)}
                  className={cn(
                    "flex items-center gap-2 justify-start",
                    mood === option.value && "bg-blue-100 text-blue-800 border-blue-300",
                  )}
                >
                  <Icon className={cn("h-4 w-4", option.color)} />
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="text-sm font-medium mb-2 block">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write about your thoughts, experiences, or reflections..."
            className="min-h-[200px] resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <Badge key={tag} variant="secondary" className={getTagColor(index)}>
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTag(tag)}
                  className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleAddTag} disabled={!newTag.trim()} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Attachments
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.md"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProgress !== null}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadProgress !== null ? "Uploading..." : "Upload File"}
            </Button>
            {uploadProgress !== null && (
              <div className="mt-3">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-500 mt-1">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>

          {/* Existing Attachments */}
          {entry?.attachments && entry.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Attached Files</h4>
              {entry.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                  {attachment.file_type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm flex-1">{attachment.original_name}</span>
                  <span className="text-xs text-gray-500">{(attachment.file_size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
