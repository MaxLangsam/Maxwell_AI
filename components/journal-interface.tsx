"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Calendar, Tag, Trash2, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const MOODS = [
  { value: "happy", label: "😊 Happy", color: "bg-yellow-100 text-yellow-800" },
  { value: "sad", label: "😢 Sad", color: "bg-blue-100 text-blue-800" },
  { value: "excited", label: "🎉 Excited", color: "bg-orange-100 text-orange-800" },
  { value: "calm", label: "😌 Calm", color: "bg-green-100 text-green-800" },
  { value: "anxious", label: "😰 Anxious", color: "bg-red-100 text-red-800" },
  { value: "thoughtful", label: "🤔 Thoughtful", color: "bg-purple-100 text-purple-800" },
]

export function JournalInterface() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMood, setSelectedMood] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")
  const [tags, setTags] = useState("")

  useEffect(() => {
    const savedEntries = localStorage.getItem("maxwell-journal-entries")
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt),
      }))
      setEntries(parsedEntries)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("maxwell-journal-entries", JSON.stringify(entries))
  }, [entries])

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMood = selectedMood === "all" || entry.mood === selectedMood
    return matchesSearch && matchesMood
  })

  const handleCreateEntry = () => {
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      title: title || "Untitled Entry",
      content,
      mood,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setEntries((prev) => [newEntry, ...prev])
    resetForm()
    setIsCreateDialogOpen(false)
  }

  const handleUpdateEntry = () => {
    if (!editingEntry) return

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === editingEntry.id
          ? {
              ...entry,
              title: title || "Untitled Entry",
              content,
              mood,
              tags: tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
              updatedAt: new Date(),
            }
          : entry,
      ),
    )
    resetForm()
    setEditingEntry(null)
  }

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setMood("")
    setTags("")
  }

  const openEditDialog = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setTitle(entry.title)
    setContent(entry.content)
    setMood(entry.mood)
    setTags(entry.tags.join(", "))
  }

  const getMoodInfo = (moodValue: string) => {
    return MOODS.find((m) => m.value === moodValue) || MOODS[0]
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Journal</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Entry title..." value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="How are you feeling?" />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map((moodOption) => (
                    <SelectItem key={moodOption.value} value={moodOption.value}>
                      {moodOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEntry}>Create Entry</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            {MOODS.map((moodOption) => (
              <SelectItem key={moodOption.value} value={moodOption.value}>
                {moodOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {entries.length === 0
              ? "No journal entries yet. Create your first entry!"
              : "No entries match your filters."}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const moodInfo = getMoodInfo(entry.mood)
            return (
              <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-lg border p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{entry.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar size={14} />
                      {entry.createdAt.toLocaleDateString()}
                      {entry.mood && <Badge className={moodInfo.color}>{moodInfo.label}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(entry)}>
                      <Edit3 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(entry.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{entry.content}</p>

                {entry.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag size={14} className="text-gray-400" />
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Entry title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue placeholder="How are you feeling?" />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map((moodOption) => (
                  <SelectItem key={moodOption.value} value={moodOption.value}>
                    {moodOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingEntry(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateEntry}>Update Entry</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
