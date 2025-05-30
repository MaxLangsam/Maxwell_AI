"use client"

import type React from "react"

import { useState } from "react"
import { Tag, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface TagManagerProps {
  sessionTags: string[]
  allTags: string[]
  onUpdateTags: (tags: string[]) => void
}

const TAG_COLORS = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
]

export function TagManager({ sessionTags, allTags, onUpdateTags }: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newTag, setNewTag] = useState("")

  const getTagColor = (tag: string) => {
    const index = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return TAG_COLORS[index % TAG_COLORS.length]
  }

  const handleAddTag = (tag: string) => {
    if (tag && !sessionTags.includes(tag)) {
      onUpdateTags([...sessionTags, tag])
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(sessionTags.filter((tag) => tag !== tagToRemove))
  }

  const handleCreateNewTag = () => {
    if (newTag.trim() && !sessionTags.includes(newTag.trim())) {
      handleAddTag(newTag.trim())
      setNewTag("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateNewTag()
    }
  }

  const availableTags = allTags.filter((tag) => !sessionTags.includes(tag))

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Tag size={12} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Current Tags */}
          <div>
            <h4 className="text-sm font-medium mb-2">Current Tags</h4>
            <div className="flex flex-wrap gap-2">
              {sessionTags.length === 0 ? (
                <p className="text-sm text-gray-500">No tags assigned</p>
              ) : (
                sessionTags.map((tag) => (
                  <Badge key={tag} className={getTagColor(tag)}>
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:bg-black/10 rounded-full p-0.5">
                      <X size={10} />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Add New Tag */}
          <div>
            <h4 className="text-sm font-medium mb-2">Add New Tag</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter tag name..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleCreateNewTag} size="sm">
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Available Tags */}
          {availableTags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Available Tags</h4>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    className={`${getTagColor(tag)} cursor-pointer hover:opacity-80`}
                    onClick={() => handleAddTag(tag)}
                  >
                    {tag}
                    <Plus size={10} className="ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
