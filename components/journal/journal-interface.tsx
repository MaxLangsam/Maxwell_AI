"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, BookOpen, Brain, Edit, Trash2, FileText } from "lucide-react"
import { JournalEntry } from "./journal-entry"
import { JournalInsights } from "./journal-insights"

interface JournalEntryData {
  id: string
  title: string
  content: string
  mood?: string
  tags: string[]
  attachments: any[]
  created_at: string
  updated_at: string
}

interface JournalInterfaceProps {
  userId: string
}

const MOOD_FILTERS = [
  { value: "all", label: "All Moods" },
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "sad", label: "Sad", emoji: "😢" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "excited", label: "Excited", emoji: "🤩" },
  { value: "anxious", label: "Anxious", emoji: "😰" },
  { value: "calm", label: "Calm", emoji: "😌" },
  { value: "frustrated", label: "Frustrated", emoji: "😤" },
  { value: "grateful", label: "Grateful", emoji: "🙏" },
]

export function JournalInterface({ userId }: JournalInterfaceProps) {
  const [entries, setEntries] = useState<JournalEntryData[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntryData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMood, setSelectedMood] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntryData | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [userId])

  useEffect(() => {
    filterEntries()
  }, [entries, searchQuery, selectedMood, selectedTag])

  const loadEntries = async () => {
    try {
      setLoading(true)
      setNeedsSetup(false)
      const response = await fetch("/api/journal/entries")

      if (response.ok) {
        const data = await response.json()
        setEntries(data.entries || [])

        // Extract all unique tags
        const tags = new Set<string>()
        data.entries?.forEach((entry: JournalEntryData) => {
          entry.tags.forEach((tag: string) => tags.add(tag))
        })
        setAllTags(Array.from(tags).sort())
      } else if (response.status === 500) {
        // Likely a database setup issue
        setNeedsSetup(true)
      }
    } catch (error) {
      console.error("Error loading entries:", error)
      setNeedsSetup(true)
    } finally {
      setLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = entries

    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedMood && selectedMood !== "all") {
      filtered = filtered.filter((entry) => entry.mood === selectedMood)
    }

    if (selectedTag && selectedTag !== "") {
      filtered = filtered.filter((entry) => entry.tags.includes(selectedTag))
    }

    setFilteredEntries(filtered)
  }

  const handleSaveEntry = async (entryData: {
    title: string
    content: string
    mood?: string
    tags: string[]
  }) => {
    try {
      const url = editingEntry ? `/api/journal/entries/${editingEntry.id}` : "/api/journal/entries"
      const method = editingEntry ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      })

      if (response.ok) {
        await loadEntries()
        setShowNewEntry(false)
        setEditingEntry(null)
      }
    } catch (error) {
      console.error("Error saving entry:", error)
    }
  }

  const handleFileUpload = async (file: File, onProgress: (progress: number) => void) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("entryId", editingEntry?.id || "")

      const response = await fetch("/api/journal/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        onProgress(100)
        await loadEntries()
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const response = await fetch(`/api/journal/entries/${entryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadEntries()
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTagColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-teal-100 text-teal-800",
      "bg-red-100 text-red-800",
    ]
    return colors[index % colors.length]
  }

  if (showNewEntry || editingEntry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Journal</h1>
          <Button
            variant="outline"
            onClick={() => {
              setShowNewEntry(false)
              setEditingEntry(null)
            }}
          >
            Back to Entries
          </Button>
        </div>
        <JournalEntry
          entry={editingEntry || undefined}
          onSave={handleSaveEntry}
          onFileUpload={handleFileUpload}
          isNew={!editingEntry}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Journal
        </h1>
        <Button onClick={() => setShowNewEntry(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search entries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOOD_FILTERS.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        <span className="flex items-center gap-2">
                          {mood.emoji && <span>{mood.emoji}</span>}
                          {mood.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Entries List */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading entries...</span>
              </CardContent>
            </Card>
          ) : needsSetup ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-orange-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Database Setup Required</h3>
                <p className="text-gray-500 mb-4">The journal system needs to be set up in your database first.</p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-orange-800 mb-2">Setup Instructions:</h4>
                  <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to SQL Editor</li>
                    <li>Copy and paste the journal_system_schema.sql migration</li>
                    <li>Execute the SQL to create the tables</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          ) : filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {entries.length === 0 ? "No entries yet" : "No entries match your filters"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {entries.length === 0
                    ? "Start your journaling journey by creating your first entry."
                    : "Try adjusting your search or filter criteria."}
                </p>
                {entries.length === 0 && (
                  <Button onClick={() => setShowNewEntry(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Entry
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{entry.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(entry.created_at)}
                          </span>
                          {entry.mood && (
                            <span className="flex items-center gap-1">
                              {MOOD_FILTERS.find((m) => m.value === entry.mood)?.emoji}
                              {entry.mood}
                            </span>
                          )}
                          {entry.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {entry.attachments.length} file{entry.attachments.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingEntry(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-3">{entry.content}</p>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, index) => (
                          <Badge key={tag} variant="secondary" className={getTagColor(index)}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights">
          <JournalInsights userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
