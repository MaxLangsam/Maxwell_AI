"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useChat } from "ai/react"
import {
  ArrowUpIcon,
  MessageSquare,
  Plus,
  Trash,
  BookOpen,
  Copy,
  Check,
  Menu,
  Brain,
  Paperclip,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { SettingsDialog } from "@/components/settings-dialog"
import { JournalInterface } from "@/components/journal-interface"
import { SecondBrainInterface } from "@/components/second-brain-interface"
import { FileUpload } from "@/components/file-upload"
import { CodeBlock } from "@/components/code-block"
import { TagManager } from "@/components/tag-manager"
import { ChatNameEditor } from "@/components/chat-name-editor"
import { SidebarFilter } from "@/components/sidebar-filter"
import { useChatSessions } from "@/hooks/use-chat-sessions"
import { useSettings } from "@/hooks/use-settings"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface ChatFormProps extends React.ComponentProps<"form"> {
  onSignOut: () => void
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

export function ChatForm({ className, onSignOut, ...props }: ChatFormProps) {
  const [currentView, setCurrentView] = useState<"chat" | "journal" | "second-brain">("chat")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("all")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { settings } = useSettings()
  const prevMessagesLengthRef = useRef(0)
  const messageUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    sessions,
    currentSessionId,
    isInitialized,
    createSession,
    switchSession,
    deleteSession,
    updateSessionTitle,
    updateSessionMessages,
    updateSessionTags,
    getCurrentSession,
    getAllTags,
    searchSessions,
  } = useChatSessions()

  const currentSession = useMemo(() => getCurrentSession(), [getCurrentSession])
  const allTags = useMemo(() => getAllTags(), [getAllTags])

  const { messages, input, setInput, append, setMessages, isLoading } = useChat({
    api: "/api/chat",
    id: currentSessionId,
    initialMessages: currentSession?.messages || [],
    onFinish: (message) => {
      // Auto-generate session title from first user message if untitled
      if (currentSession && currentSession.title === "New Chat" && messages.length === 1) {
        const firstUserMessage = messages[0]?.content
        if (firstUserMessage) {
          const title = firstUserMessage.slice(0, 30) + (firstUserMessage.length > 30 ? "..." : "")
          updateSessionTitle(currentSessionId, title)
        }
      }
    },
  })

  // Debounced message update to prevent excessive state updates
  const debouncedUpdateMessages = useCallback(
    (sessionId: string, newMessages: typeof messages) => {
      if (messageUpdateTimeoutRef.current) {
        clearTimeout(messageUpdateTimeoutRef.current)
      }

      messageUpdateTimeoutRef.current = setTimeout(() => {
        updateSessionMessages(sessionId, newMessages)
        messageUpdateTimeoutRef.current = null
      }, 500) // 500ms debounce
    },
    [updateSessionMessages],
  )

  // Sync messages with current session only when messages actually change
  useEffect(() => {
    if (!isInitialized || !currentSession) return

    // Only update if the message count has changed
    if (messages.length !== prevMessagesLengthRef.current) {
      prevMessagesLengthRef.current = messages.length
      if (messages.length > 0) {
        debouncedUpdateMessages(currentSessionId, messages)
      }
    }

    return () => {
      if (messageUpdateTimeoutRef.current) {
        clearTimeout(messageUpdateTimeoutRef.current)
      }
    }
  }, [messages, currentSessionId, isInitialized, debouncedUpdateMessages, currentSession])

  // Update messages when switching sessions
  useEffect(() => {
    if (isInitialized && currentSession) {
      // Reset the messages length ref
      prevMessagesLengthRef.current = currentSession.messages.length
      setMessages(currentSession.messages)
    }
  }, [currentSessionId, isInitialized, setMessages, currentSession])

  // Auto-scroll to bottom
  useEffect(() => {
    if (settings.autoScrollToBottom && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, settings.autoScrollToBottom])

  const getTagColor = (tag: string) => {
    const index = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return TAG_COLORS[index % TAG_COLORS.length]
  }

  // Filter sessions based on search and tag
  const filteredSessions = useMemo(() => {
    let filtered = sessions

    // Filter by search term
    if (searchTerm) {
      filtered = searchSessions(searchTerm)
    }

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter((session) => session.tags.includes(selectedTag))
    }

    return filtered
  }, [sessions, searchTerm, selectedTag, searchSessions])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() && uploadedFiles.length === 0) return
    if (isLoading) return

    let content = input.trim()

    // Add file information to the message if files are attached
    if (uploadedFiles.length > 0) {
      const fileInfo = uploadedFiles.map((file) => `[File: ${file.name} (${file.type})]`).join("\n")
      content = content ? `${content}\n\n${fileInfo}` : fileInfo
    }

    void append({ content, role: "user" })
    setInput("")
    setUploadedFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const handleFileUpload = (file: File) => {
    setUploadedFiles((prev) => [...prev, file])
  }

  const handleNewSession = useCallback(() => {
    const newSessionId = createSession()
    switchSession(newSessionId)
    setMessages([])
    prevMessagesLengthRef.current = 0
  }, [createSession, switchSession, setMessages])

  const handleSwitchSession = useCallback(
    (sessionId: string) => {
      if (sessionId !== currentSessionId) {
        switchSession(sessionId)
      }
    },
    [currentSessionId, switchSession],
  )

  const handleDeleteSession = useCallback(
    (sessionId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      deleteSession(sessionId)
      if (sessionId === currentSessionId) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId)
        if (remainingSessions.length > 0) {
          handleSwitchSession(remainingSessions[0].id)
        } else {
          handleNewSession()
        }
      }
    },
    [deleteSession, currentSessionId, sessions, handleSwitchSession, handleNewSession],
  )

  const handleUpdateSessionName = useCallback(
    (sessionId: string, newName: string) => {
      updateSessionTitle(sessionId, newName)
    },
    [updateSessionTitle],
  )

  const handleUpdateSessionTags = useCallback(
    (sessionId: string, tags: string[]) => {
      updateSessionTags(sessionId, tags)
    },
    [updateSessionTags],
  )

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }

  const renderMessageContent = (content: string, messageId: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {content.slice(lastIndex, match.index)}
          </span>,
        )
      }

      const language = match[1] || "text"
      const code = match[2]
      parts.push(
        <CodeBlock
          key={`code-${match.index}`}
          language={language}
          value={code}
          showLineNumbers={settings.showCodeLineNumbers}
        />,
      )

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.slice(lastIndex)}
        </span>,
      )
    }

    if (parts.length === 0) {
      return (
        <div className="relative group">
          <div className="whitespace-pre-wrap">{content}</div>
          <button
            onClick={() => handleCopyMessage(content, messageId)}
            className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Copy message"
          >
            {copiedMessageId === messageId ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy
                size={14}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              />
            )}
          </button>
        </div>
      )
    }

    return (
      <div className="relative group">
        <div className="space-y-4">{parts}</div>
        <button
          onClick={() => handleCopyMessage(content, messageId)}
          className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy message"
        >
          {copiedMessageId === messageId ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
          )}
        </button>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const groupedSessions = useMemo(() => {
    return filteredSessions.reduce(
      (groups, session) => {
        const date = new Date(session.updatedAt)
        const dateStr = formatDate(date)
        if (!groups[dateStr]) {
          groups[dateStr] = []
        }
        groups[dateStr].push(session)
        return groups
      },
      {} as Record<string, typeof filteredSessions>,
    )
  }, [filteredSessions])

  const sortedDates = useMemo(() => {
    return Object.keys(groupedSessions).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime()
    })
  }, [groupedSessions])

  // Don't render until initialized to prevent hydration issues
  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 mx-auto">
            M
          </div>
          <p>Loading Maxwell...</p>
        </div>
      </div>
    )
  }

  if (currentView === "journal") {
    return (
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="flex-1">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setCurrentView("chat")} className="flex items-center gap-2">
              <MessageSquare size={16} />
              Back to Chat
            </Button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SettingsDialog />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onSignOut}>
                <LogOut size={16} />
              </Button>
            </div>
          </div>
          <JournalInterface />
        </div>
      </div>
    )
  }

  if (currentView === "second-brain") {
    return (
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="flex-1">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setCurrentView("chat")} className="flex items-center gap-2">
              <MessageSquare size={16} />
              Back to Chat
            </Button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SettingsDialog />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onSignOut}>
                <LogOut size={16} />
              </Button>
            </div>
          </div>
          <SecondBrainInterface />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Maxwell</h2>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSidebarOpen(false)}>
              <Menu size={16} />
            </Button>
          </div>

          {/* Search and Filter */}
          <SidebarFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            allTags={allTags}
          />

          {/* New Chat Button */}
          <div className="p-2">
            <Button
              onClick={handleNewSession}
              className="w-full justify-start gap-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
            >
              <Plus size={16} />
              New chat
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-2 pb-2">
              {sortedDates.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {searchTerm || selectedTag !== "all" ? "No chats match your filters" : "No chats yet"}
                </div>
              ) : (
                sortedDates.map((dateStr) => (
                  <div key={dateStr} className="mb-4">
                    <h3 className="px-3 mb-2 text-xs text-gray-500 dark:text-gray-400 font-medium">{dateStr}</h3>
                    <div className="space-y-1">
                      {groupedSessions[dateStr].map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            "rounded-md text-sm group",
                            session.id === currentSessionId
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
                          )}
                        >
                          <button
                            onClick={() => handleSwitchSession(session.id)}
                            className="w-full text-left px-3 py-2 flex items-center gap-2"
                          >
                            <MessageSquare size={14} className="flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <ChatNameEditor
                                currentName={session.title}
                                onUpdateName={(newName) => handleUpdateSessionName(session.id, newName)}
                              />
                              {session.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {session.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} className={`${getTagColor(tag)} text-xs`}>
                                      {tag}
                                    </Badge>
                                  ))}
                                  {session.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{session.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                          {session.id === currentSessionId && (
                            <div className="flex items-center justify-end gap-1 px-3 pb-2">
                              <TagManager
                                sessionTags={session.tags}
                                allTags={allTags}
                                onUpdateTags={(tags) => handleUpdateSessionTags(session.id, tags)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                onClick={(e) => handleDeleteSession(session.id, e)}
                              >
                                <Trash size={12} />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSidebarOpen(true)}>
                <Menu size={16} />
              </Button>
            )}
            <h1 className="text-lg font-medium">Maxwell</h1>
            {currentSession && currentSession.tags.length > 0 && (
              <div className="flex gap-1">
                {currentSession.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} className={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))}
                {currentSession.tags.length > 3 && <Badge variant="outline">+{currentSession.tags.length - 3}</Badge>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <BookOpen size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Journal</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto">
                  <JournalInterface />
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Brain size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Second Brain</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto">
                  <SecondBrainInterface />
                </div>
              </DialogContent>
            </Dialog>
            <ThemeToggle />
            <SettingsDialog />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onSignOut}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6">
                M
              </div>
              <h1 className="text-3xl font-semibold mb-4">How can I help you today?</h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                I'm Maxwell, your personal AI assistant. I can help with coding, writing, analysis, and much more!
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full px-4 py-6" style={{ fontSize: `${settings.fontSize}px` }}>
              {messages.map((message, index) => (
                <div key={index} className={cn("mb-6", message.role === "user" ? "text-right" : "")}>
                  <div
                    className={cn(
                      "inline-block max-w-[80%] text-left",
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3"
                        : "bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3",
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          M
                        </div>
                        <span className="font-medium">Maxwell</span>
                      </div>
                    )}
                    {renderMessageContent(message.content, `msg-${index}`)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
            <div className="relative flex items-end">
              <div className="absolute left-3 bottom-3 flex items-center justify-center">
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
              <AutoResizeTextarea
                onKeyDown={handleKeyDown}
                onChange={(v) => setInput(v)}
                value={input}
                disabled={isLoading}
                placeholder="Message Maxwell..."
                maxHeight={300}
                className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                style={{ fontSize: `${settings.fontSize}px` }}
              />
              <Button
                type="submit"
                disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
              >
                <ArrowUpIcon size={16} />
              </Button>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full flex items-center"
                  >
                    <Paperclip size={12} className="mr-1" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Maxwell can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
