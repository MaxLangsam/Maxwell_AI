"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, MessageSquare, Trash2, Edit2, Check, X, Tag, Filter, LogOut } from "lucide-react"
import type { ChatSession } from "@/hooks/use-chat-sessions"
import { cn } from "@/lib/utils"
import { TagManager } from "@/components/tag-manager"
import { getTagColor } from "@/lib/utils/tag-colors"
import { useAuth } from "@/components/providers/auth-provider"
import { ThemeToggle } from "./theme-toggle"
import { SettingsDialog } from "./settings/settings-dialog"

interface SessionSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string
  isOpen: boolean
  onClose: () => void
  onNewSession: () => void
  onSwitchSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onUpdateTitle: (sessionId: string, title: string) => void
  onUpdateTags: (sessionId: string, tags: string[]) => void
  allTags: string[]
}

export function SessionSidebar({
  sessions,
  currentSessionId,
  isOpen,
  onClose,
  onNewSession,
  onSwitchSession,
  onDeleteSession,
  onUpdateTitle,
  onUpdateTags,
  allTags,
}: SessionSidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [managingTagsSessionId, setManagingTagsSessionId] = useState<string | null>(null)
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null)
  const { signOut } = useAuth()

  const handleEditStart = (session: ChatSession) => {
    setEditingSessionId(session.id)
    setEditTitle(session.title)
  }

  const handleEditSave = () => {
    if (editingSessionId && editTitle.trim()) {
      onUpdateTitle(editingSessionId, editTitle.trim())
    }
    setEditingSessionId(null)
    setEditTitle("")
  }

  const handleEditCancel = () => {
    setEditingSessionId(null)
    setEditTitle("")
  }

  const handleTagsUpdate = (sessionId: string, tags: string[]) => {
    onUpdateTags(sessionId, tags)
    setManagingTagsSessionId(null)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  // Filter sessions by selected tag
  const filteredSessions = selectedTagFilter
    ? sessions.filter((session) => session.tags.includes(selectedTagFilter))
    : sessions

  // Get tag counts
  const tagCounts = allTags.reduce(
    (acc, tag) => {
      acc[tag] = sessions.filter((session) => session.tags.includes(tag)).length
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat Sessions</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
                <X size={16} />
              </Button>
            </div>
            <Button onClick={onNewSession} className="w-full" size="sm">
              <Plus size={16} className="mr-2" />
              New Chat
            </Button>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={14} />
                <span className="text-sm font-medium">Filter by Tag</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={selectedTagFilter === null ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setSelectedTagFilter(null)}
                >
                  All ({sessions.length})
                </Button>
                {allTags.map((tag) => {
                  const tagColor = getTagColor(tag)
                  return (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-7 text-xs border-2 hover:opacity-80",
                        selectedTagFilter === tag
                          ? `${tagColor.bg} ${tagColor.text} ${tagColor.border}`
                          : `${tagColor.bgLight} ${tagColor.text} ${tagColor.border}`,
                      )}
                      onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                    >
                      {tag} ({tagCounts[tag]})
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredSessions.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
                {selectedTagFilter ? `No sessions with "${selectedTagFilter}" tag` : "No sessions yet"}
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative p-3 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors mb-2 bg-gray-50 dark:bg-gray-800",
                    session.id === currentSessionId &&
                      "bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-800 shadow-sm",
                  )}
                  onClick={() => onSwitchSession(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingSessionId === session.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-7 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditSave()
                              if (e.key === "Escape") handleEditCancel()
                            }}
                            autoFocus
                          />
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleEditSave}>
                            <Check size={12} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleEditCancel}>
                            <X size={12} />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div
                            className="flex items-center gap-2 mb-1"
                            onDoubleClick={(e) => {
                              e.stopPropagation()
                              handleEditStart(session)
                            }}
                          >
                            <MessageSquare size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span className="text-sm font-medium truncate dark:text-gray-200">{session.title}</span>
                          </div>

                          {/* Colored Tags */}
                          {session.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {session.tags.map((tag) => {
                                const tagColor = getTagColor(tag)
                                return (
                                  <span
                                    key={tag}
                                    className={cn(
                                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                                      tagColor.bg,
                                      tagColor.text,
                                      tagColor.border,
                                    )}
                                  >
                                    {tag}
                                  </span>
                                )
                              })}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {session.messages.length} messages
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDate(session.updatedAt)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {editingSessionId !== session.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setManagingTagsSessionId(session.id)
                          }}
                        >
                          <Tag size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditStart(session)
                          }}
                        >
                          <Edit2 size={12} />
                        </Button>
                        {sessions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteSession(session.id)
                            }}
                          >
                            <Trash2 size={12} />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* User Menu */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <span className="text-sm font-medium dark:text-gray-200">Maxwell</span>
              </div>
              <div className="flex items-center">
                <ThemeToggle />
                <SettingsDialog />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={signOut}>
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tag Manager Modal */}
      {managingTagsSessionId && (
        <TagManager
          session={sessions.find((s) => s.id === managingTagsSessionId)!}
          allTags={allTags}
          onSave={(tags) => handleTagsUpdate(managingTagsSessionId, tags)}
          onCancel={() => setManagingTagsSessionId(null)}
        />
      )}
    </>
  )
}
