"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"

import { useChat } from "ai/react"

import { ArrowUpIcon, Plus, MessageSquare, Sparkles, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useChatSessions } from "@/hooks/use-chat-sessions"
import { SessionSidebar } from "@/components/session-sidebar"

const MAXWELL_GREETINGS = [
  "Hello! I'm Maxwell. What's on your mind today?",
  "Hi there! I'm Maxwell, and I'm here to help. What can we explore together?",
  "Welcome! I'm Maxwell. What interesting challenge can I help you tackle?",
  "Hey! Maxwell here. What would you like to dive into today?",
  "Hello! I'm Maxwell. I'm curious - what brings you here today?",
]

const CONVERSATION_STARTERS = [
  "Help me brainstorm ideas for...",
  "Explain how this works...",
  "What's the best way to...",
  "I'm trying to understand...",
  "Can you help me plan...",
  "What are your thoughts on...",
]

interface UserChatFormProps extends React.ComponentProps<"form"> {
  userEmail?: string
  onSignOut?: () => void
}

export function UserChatForm({ className, userEmail, onSignOut, ...props }: UserChatFormProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentGreeting, setCurrentGreeting] = useState("")

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
  } = useChatSessions()

  const currentSession = getCurrentSession()
  const allTags = getAllTags()

  // Set a random greeting on component mount
  useEffect(() => {
    setCurrentGreeting(MAXWELL_GREETINGS[Math.floor(Math.random() * MAXWELL_GREETINGS.length)])
  }, [])

  const { messages, input, setInput, append, setMessages } = useChat({
    api: "/api/chat",
    id: currentSessionId,
    initialMessages: currentSession?.messages || [],
    onFinish: (message) => {
      // Auto-generate session title from first user message if untitled
      if (currentSession && currentSession.title === "New Chat" && messages.length === 0) {
        const firstUserMessage = messages.find((m) => m.role === "user")?.content || input
        if (firstUserMessage) {
          const title = firstUserMessage.slice(0, 30) + (firstUserMessage.length > 30 ? "..." : "")
          updateSessionTitle(currentSessionId, title)
        }
      }
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

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
  }

  const handleSwitchSession = (sessionId: string) => {
    switchSession(sessionId)
    const session = sessions.find((s) => s.id === sessionId)
    setMessages(session?.messages || [])
    setSidebarOpen(false)
  }

  const handleDeleteSession = (sessionId: string) => {
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

  const handleStarterClick = (starter: string) => {
    setInput(starter)
  }

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
          M
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Maxwell
          </h1>
          <p className="text-sm text-muted-foreground">Your AI Assistant</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-lg text-foreground font-medium">{currentGreeting}</p>
        <p className="text-muted-foreground text-sm">
          I'm here to help you think through problems, explore ideas, and get things done. Let's have a great
          conversation!
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles size={16} />
          <span>Try asking me about:</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {CONVERSATION_STARTERS.map((starter, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-left justify-start h-auto py-2 px-3 text-sm hover:bg-blue-50 hover:border-blue-200"
              onClick={() => handleStarterClick(starter)}
            >
              {starter}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        💡 Tip: I work best when you give me context and ask follow-up questions!
      </p>
    </header>
  )

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => (
        <div
          key={index}
          data-role={message.role}
          className={cn(
            "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
            message.role === "assistant"
              ? "self-start bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200"
              : "self-end bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm",
          )}
        >
          {message.role === "assistant" && (
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-[8px]">
                M
              </div>
              Maxwell
            </div>
          )}
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex h-svh">
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewSession={handleNewSession}
        onSwitchSession={handleSwitchSession}
        onDeleteSession={handleDeleteSession}
        onUpdateTitle={updateSessionTitle}
        onUpdateTags={updateSessionTags}
        allTags={allTags}
      />

      <main
        className={cn(
          "ring-none mx-auto flex h-svh max-h-svh w-full max-w-[35rem] flex-col items-stretch border-none transition-all",
          sidebarOpen && "ml-80",
          className,
        )}
        {...props}
      >
        {/* Header with session controls and user info */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2"
            >
              <MessageSquare size={16} />
              Sessions
            </Button>
            <span className="text-sm text-muted-foreground">{currentSession?.title || "New Chat"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleNewSession} className="flex items-center gap-2">
              <Plus size={16} />
              New
            </Button>
            {userEmail && <div className="text-xs text-gray-500 hidden sm:block">{userEmail}</div>}
            {onSignOut && (
              <Button variant="ghost" size="sm" onClick={onSignOut} className="flex items-center gap-2">
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 content-center overflow-y-auto px-6">{messages.length ? messageList : header}</div>

        <form
          onSubmit={handleSubmit}
          className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0 shadow-sm"
        >
          <AutoResizeTextarea
            onKeyDown={handleKeyDown}
            onChange={(v) => setInput(v)}
            value={input}
            placeholder="Ask Maxwell anything..."
            className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-1 right-1 size-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                >
                  <ArrowUpIcon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={12}>Send to Maxwell</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </form>
      </main>
    </div>
  )
}
