"use client"

import { useState } from "react"
import { Plus, Search, Tag, Calendar, Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotes } from "@/hooks/use-notes"
import { cn } from "@/lib/utils"

interface NotesPanelProps {
  userId: string
}

export function NotesPanel({ userId }: NotesPanelProps) {
  const { notes, createNote, updateNote, deleteNote } = useNotes(userId)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredNotes = notes.filter((note) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    if (activeTab === "all") return matchesSearch
    return matchesSearch && note.category === activeTab
  })

  const handleCreateNote = () => {
    const newNote = createNote({
      title: "New Note",
      content: "",
      category: activeTab === "all" ? "general" : activeTab,
    })
    setEditingNoteId(newNote.id)
    setEditTitle(newNote.title)
    setEditContent(newNote.content)
  }

  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const handleSaveNote = () => {
    if (editingNoteId) {
      updateNote(editingNoteId, {
        title: editTitle,
        content: editContent,
      })
      setEditingNoteId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
  }

  const handleDeleteNote = (noteId: string) => {
    if (editingNoteId === noteId) {
      setEditingNoteId(null)
    }
    deleteNote(noteId)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={16}
          />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={handleCreateNote} size="sm" className="ml-2">
          <Plus size={16} className="mr-1" />
          New Note
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="ideas">Ideas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery ? "No notes match your search" : "No notes yet. Create your first note!"}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "p-4 rounded-lg border",
                editingNoteId === note.id
                  ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
              )}
            >
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note title"
                    className="font-medium"
                  />
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Note content"
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X size={14} className="mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveNote}>
                      <Save size={14} className="mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">{note.title}</h3>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditNote(note)}>
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:text-red-600 dark:hover:text-red-400"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                    {note.content || <span className="italic text-gray-400">No content</span>}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Tag size={12} className="mr-1" />
                      <span className="capitalize">{note.category}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      <span>{formatDate(new Date(note.updatedAt))}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
