"use client"

import { useState, useEffect } from "react"
import { Search, FolderOpen, Tag, Plus, Trash2, Edit2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  category: string
  createdAt: Date
  updatedAt: Date
}

export function SecondBrainInterface() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [notes, setNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
    category: "",
  })

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("maxwell-second-brain-notes")
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }))
      setNotes(parsedNotes)

      // Extract unique categories and tags
      const uniqueCategories = [...new Set(parsedNotes.map((note: Note) => note.category))].filter(Boolean)
      const uniqueTags = [...new Set(parsedNotes.flatMap((note: Note) => note.tags))].filter(Boolean)

      setCategories(uniqueCategories)
      setTags(uniqueTags)
    }
  }, [])

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("maxwell-second-brain-notes", JSON.stringify(notes))
    }
  }, [notes])

  const handleCreateNote = () => {
    if (!newNote.title.trim()) return

    const note: Note = {
      id: `note-${Date.now()}`,
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      category: newNote.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setNotes((prev) => [note, ...prev])
    setIsCreating(false)
    setNewNote({
      title: "",
      content: "",
      tags: "",
      category: "",
    })

    // Update categories and tags
    if (note.category && !categories.includes(note.category)) {
      setCategories((prev) => [...prev, note.category])
    }

    note.tags.forEach((tag) => {
      if (!tags.includes(tag)) {
        setTags((prev) => [...prev, tag])
      }
    })
  }

  const handleUpdateNote = () => {
    if (!editingNote) return

    setNotes((prev) =>
      prev.map((note) => (note.id === editingNote.id ? { ...editingNote, updatedAt: new Date() } : note)),
    )

    setEditingNote(null)

    // Update categories and tags
    const allNotes = notes.map((note) => (note.id === editingNote.id ? editingNote : note))

    const uniqueCategories = [...new Set(allNotes.map((note) => note.category))].filter(Boolean)
    const uniqueTags = [...new Set(allNotes.flatMap((note) => note.tags))].filter(Boolean)

    setCategories(uniqueCategories)
    setTags(uniqueTags)
  }

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))

    // Update categories and tags after deletion
    const remainingNotes = notes.filter((note) => note.id !== id)
    const uniqueCategories = [...new Set(remainingNotes.map((note) => note.category))].filter(Boolean)
    const uniqueTags = [...new Set(remainingNotes.flatMap((note) => note.tags))].filter(Boolean)

    setCategories(uniqueCategories)
    setTags(uniqueTags)
  }

  const filteredNotes = notes.filter((note) => {
    // Filter by tab
    if (activeTab !== "all" && activeTab !== note.category) {
      return false
    }

    // Filter by search term
    if (
      searchTerm &&
      !note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !note.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false
    }

    return true
  })

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Second Brain</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus size={16} className="mr-2" />
            New Note
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="all" className="mr-2 mb-2">
            All Notes
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="mr-2 mb-2">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {isCreating ? (
            <Card>
              <CardHeader>
                <CardTitle>Create New Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={8}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Category"
                    value={newNote.category}
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNote}>Create Note</Button>
                </div>
              </CardContent>
            </Card>
          ) : editingNote ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Title"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Content"
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    rows={8}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Category"
                    value={editingNote.category}
                    onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Tags (comma separated)"
                    value={editingNote.tags.join(", ")}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingNote(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateNote}>Update Note</Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {notes.length === 0 ? "No notes yet. Create your first note!" : "No notes match your filters."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingNote(note)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{new Date(note.updatedAt).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                  </CardContent>
                  <div className="p-4 pt-0 mt-auto">
                    {note.category && (
                      <Badge className="mb-2 mr-2" variant="outline">
                        <FolderOpen size={12} className="mr-1" />
                        {note.category}
                      </Badge>
                    )}
                    {note.tags.map((tag) => (
                      <Badge key={tag} className="mb-2 mr-2" variant="secondary">
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
