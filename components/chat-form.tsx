"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useChat } from "ai/react"
import { ArrowUpIcon, MessageSquare, LogOut, AlertCircle, BookOpen, Menu, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { useChatSessions } from "@/hooks/use-chat-sessions"
import { useAuth } from "@/components/providers/auth-provider"
import { JournalInterface } from "./journal/journal-interface"
import { SessionSidebar } from "./session-sidebar"
import { ThemeToggle } from "./theme-toggle"
import { FileUpload } from "./file-upload"
import { InsightsButton } from "./insights/insights-button"
import { NotesButton } from "./notes/notes-button"
import { SettingsDialog } from "./settings/settings-dialog"
import { CodeBlock } from "./code-block"
import { useSettings } from "@/hooks/use-settings"

const MAXWELL_GREETINGS = [
  "Hello! I'm Maxwell. What's on your mind today?",
  "Hi there! I'm Maxwell. What's on your mind today?",
  "Hi there! I'm Maxwell, and I'm here to help. What can we explore together?",
  "Welcome! I'm Maxwell. What interesting challenge can I help you tackle?",
  "Hey! Maxwell here. What would you like to dive into today?",
  "Hello! I'm Maxwell. I'm curious - what brings you here today?",
]

export function ChatForm() {
  const [currentGreeting, setCurrentGreeting] = useState("")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"chat" | "journal">("chat")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { signOut, user } = useAuth()
  const { settings } = useSettings()

  const {
    sessions,
    currentSessionId,
    createSession,
    switchSession,
    deleteSession,
    updateSessionTitle,
    updateSessionTags,
    getCurrentSession,
    getAllTags,
    addFileToSession,
    updateSessionMessages,
  } = useChatSessions()

  const currentSession = getCurrentSession()
  const allTags = getAllTags()

  // Set a random greeting on component mount
  useEffect(() => {
    setCurrentGreeting(MAXWELL_GREETINGS[Math.floor(Math.random() * MAXWELL_GREETINGS.length)])
  }, [])

  const {
    messages,
    input,
    setInput,
    append,
    setMessages,
    isLoading,
    error: chatError,
  } = useChat({
    api: "/api/chat",
    id: currentSessionId,
    initialMessages: currentSession?.messages || [],
    onError: (error) => {
      console.error("Chat error:", error)
      setError("I'm having trouble connecting right now. Please check your internet connection and try again.")
    },
    onFinish: (message) => {
      setError(null) // Clear any previous errors on successful response
      // Auto-generate session title from first user message if untitled
      if (currentSession && currentSession.title === "New Chat" && messages.length === 1) {
        const firstUserMessage = messages[0].content
        if (firstUserMessage) {
          const title = firstUserMessage.slice(0, 30) + (firstUserMessage.length > 30 ? "..." : "")
          updateSessionTitle(currentSessionId, title)
        }
      }
    },
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    if (settings.autoScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, settings.autoScrollToBottom])

  // Add this effect after the existing useEffect hooks
  useEffect(() => {
    // Sync messages with current session
    if (currentSession && messages.length > 0) {
      updateSessionMessages(currentSessionId, messages)
    }
  }, [messages, currentSessionId, updateSessionMessages])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setError(null) // Clear any previous errors
    void append({ content: input, role: "user" })
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const handleNewSession = () => {
    const newSessionId = createSession()
    switchSession(newSessionId)
    setMessages([])
    setError(null)
  }

  const handleSwitchSession = (sessionId: string) => {
    switchSession(sessionId)
    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      setMessages(session.messages || [])
    } else {
      setMessages([])
    }
    setMobileSidebarOpen(false)
    setError(null)
  }

  const handleDeleteSession = (sessionId: string) => {
    // Fix: Stop event propagation to prevent triggering parent click handlers
    deleteSession(sessionId)
    if (sessionId === currentSessionId) {
      const remainingSessions = sessions.filter((s) => s.id !== sessionId)
      if (remainingSessions.length > 0) {
        handleSwitchSession(remainingSessions[0].id)
      } else {
        handleNewSession()
      }
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      // In a real implementation, you would upload the file to a server
      // and get back a URL or ID
      const fileUrl = URL.createObjectURL(file)

      // Add file to the current session
      addFileToSession(currentSessionId, {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: fileUrl,
        uploadedAt: new Date(),
      })

      // Add a message about the file
      append({
        content: `[File uploaded: ${file.name}]`,
        role: "user",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      setError("Failed to upload file. Please try again.")
    }
  }

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }

  // Function to parse and render message content with code blocks
  const renderMessageContent = (content: string, messageId: string) => {
    // Simple regex to detect code blocks (\`\`\`language\ncode\`\`\`)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    // Find all code blocks
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {content.slice(lastIndex, match.index)}
          </span>,
        )
      }

      // Add code block
      const language = match[1] || "text"
      const code = match[2]
      parts.push(<CodeBlock key={`code-${match.index}`} language={language} value={code} />)

      lastIndex = match.index + match[0].length
    }

    // Add remaining text after last code block
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.slice(lastIndex)}
        </span>,
      )
    }

    // If no code blocks were found, return the content as is
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

  if (currentView === "journal") {
    return (
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 lg:relative">
          {/* Navigation */}
          <div className="p-2 space-y-1">
            <Button onClick={() => setCurrentView("chat")} variant="ghost" className="w-full justify-start gap-2">
              <MessageSquare size={16} />
              Chat
            </Button>
            <Button onClick={() => setCurrentView("journal")} variant="default" className="w-full justify-start gap-2">
              <BookOpen size={16} />
              Journal
            </Button>
          </div>

          {/* User Menu */}
          <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <span className="text-sm font-medium">Maxwell</span>
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

        {/* Main Journal Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <JournalInterface userId={user?.id || ""} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Floating Toggle Button (when sidebar is closed) */}
      {!sidebarOpen && (
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 left-4 z-40 bg-white dark:bg-gray-800 shadow-md lg:block hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={16} />
        </Button>
      )}

      {/* Enhanced Session Sidebar with Tags */}
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        isOpen={mobileSidebarOpen || sidebarOpen}
        onClose={() => {
          setMobileSidebarOpen(false)
          setSidebarOpen(false)
        }}
        onNewSession={handleNewSession}
        onSwitchSession={handleSwitchSession}
        onDeleteSession={handleDeleteSession}
        onUpdateTitle={updateSessionTitle}
        onUpdateTags={updateSessionTags}
        allTags={allTags}
      />

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-all duration-200",
          !sidebarOpen && "lg:ml-0",
        )}
      >
        {/* Top Bar with Insights */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <MessageSquare size={16} />
            </Button>
            <h1 className="text-lg font-medium ml-2">Maxwell</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotesButton userId={user?.id || ""} />
            <InsightsButton userId={user?.id || ""} />
            <ThemeToggle />
            <SettingsDialog />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800/30 p-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto h-6 w-6 p-0 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 sm:px-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6">
                M
              </div>
              <h1 className="text-3xl font-semibold text-center mb-6">How can I help you today?</h1>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">{currentGreeting}</p>
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-lg">
                <p className="mb-2">I'm running in basic conversation mode. I can help with:</p>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div>• General questions</div>
                  <div>• Problem solving</div>
                  <div>• Creative writing</div>
                  <div>• Learning assistance</div>
                  <div>• Brainstorming</div>
                  <div>• Research help</div>
                </div>
                <p className="mt-4 text-xs">For advanced features like tasks and notes, database setup is required.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full px-4 py-6 sm:px-8" style={{ fontSize: `${settings.fontSize}px` }}>
              {messages.map((message, index) => (
                <div key={index} className={cn("mb-6 last:mb-8", message.role === "user" ? "text-right" : "")}>
                  <div
                    className={cn(
                      "inline-block max-w-[90%] sm:max-w-[80%] text-left",
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
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center">
                <FileUpload onFileUpload={handleFileUpload} className="mr-2" />
                <div className="flex-1 relative">
                  <AutoResizeTextarea
                    onKeyDown={handleKeyDown}
                    onChange={(v) => setInput(v)}
                    value={input}
                    disabled={isLoading}
                    placeholder="Message Maxwell..."
                    className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-36 dark:bg-gray-800 dark:text-white"
                    style={{ fontSize: `${settings.fontSize}px` }}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowUpIcon size={16} />
                  </Button>
                </div>
              </div>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Maxwell can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
