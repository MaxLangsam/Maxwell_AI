"use client"

import type React from "react"

import { useState } from "react"
import { Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatNameEditorProps {
  currentName: string
  onUpdateName: (newName: string) => void
}

export function ChatNameEditor({ currentName, onUpdateName }: ChatNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(currentName)

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditedName(currentName)
  }

  const handleSave = () => {
    if (editedName.trim() && editedName.trim() !== currentName) {
      onUpdateName(editedName.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedName(currentName)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 w-full">
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onKeyDown={handleKeyPress}
          className="h-6 text-xs flex-1 min-w-0"
          autoFocus
        />
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleSave}>
          <Check size={10} />
        </Button>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleCancel}>
          <X size={10} />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 w-full group">
      <span className="truncate flex-1 text-sm">{currentName}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleStartEdit}
      >
        <Edit2 size={10} />
      </Button>
    </div>
  )
}
