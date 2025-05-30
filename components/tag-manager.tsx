"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Check, Tag } from "lucide-react"
import type { ChatSession } from "@/hooks/use-chat-sessions"
import { PREDEFINED_TAGS } from "@/hooks/use-chat-sessions"
import { getTagColor } from "@/lib/utils/tag-colors"
import { cn } from "@/lib/utils"

interface TagManagerProps {
  session: ChatSession
  allTags: string[]
  onSave: (tags: string[]) => void
  onCancel: () => void
}

export function TagManager({ session, allTags, onSave, onCancel }: TagManagerProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(session.tags)
  const [newTag, setNewTag] = useState("")

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleAddCustomTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags((prev) => [...prev, trimmedTag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddCustomTag()
    }
  }

  // Combine predefined tags with existing custom tags
  const availableTags = [...new Set([...PREDEFINED_TAGS, ...allTags])].sort()

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={24} className="text-blue-500" />
              <h3 className="text-2xl font-semibold dark:text-white">Manage Tags</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} className="h-10 w-10">
              <X size={20} />
            </Button>
          </div>
          <p className="text-md text-gray-600 dark:text-gray-300 mt-2">
            Organize your conversation with Maxwell using colorful tags
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mb-6">
              <Label className="text-lg font-medium mb-3 block dark:text-gray-200">Selected Tags</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => {
                  const tagColor = getTagColor(tag)
                  return (
                    <span
                      key={tag}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-2",
                        tagColor.bg,
                        tagColor.text,
                        tagColor.border,
                      )}
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add Custom Tag */}
          <div className="mb-6">
            <Label className="text-lg font-medium mb-3 block dark:text-gray-200">Add Custom Tag</Label>
            <div className="flex gap-3">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter custom tag"
                className="flex-1 h-12 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button
                onClick={handleAddCustomTag}
                disabled={!newTag.trim() || selectedTags.includes(newTag.trim())}
                size="lg"
                className="h-12 px-5"
              >
                <Plus size={20} className="mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Available Tags */}
          <div>
            <Label className="text-lg font-medium mb-3 block dark:text-gray-200">Available Tags</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableTags.map((tag) => {
                const tagColor = getTagColor(tag)
                const isSelected = selectedTags.includes(tag)
                return (
                  <Button
                    key={tag}
                    variant="outline"
                    size="lg"
                    className={cn(
                      "justify-start text-base h-12 border-2 transition-all",
                      isSelected
                        ? `${tagColor.bg} ${tagColor.text} ${tagColor.border} shadow-md`
                        : `${tagColor.bgLight} ${tagColor.text} ${tagColor.border} hover:${tagColor.bg}`,
                    )}
                    onClick={() => handleToggleTag(tag)}
                  >
                    {isSelected && <Check size={16} className="mr-2" />}
                    {tag}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end bg-gray-50 dark:bg-gray-800">
          <Button variant="outline" onClick={onCancel} size="lg" className="h-12 px-6 text-base">
            Cancel
          </Button>
          <Button onClick={() => onSave(selectedTags)} size="lg" className="h-12 px-8 text-base font-medium">
            Save Tags
          </Button>
        </div>
      </div>
    </div>
  )
}
