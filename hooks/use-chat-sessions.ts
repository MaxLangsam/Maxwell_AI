"use client"

import { useState, useEffect } from "react"
import type { Message } from "ai"

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  tags: string[]
  files: FileAttachment[]
  createdAt: Date
  updatedAt: Date
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: Date
}

const SESSIONS_STORAGE_KEY = "chat-sessions"
const CURRENT_SESSION_KEY = "current-session-id"

export const PREDEFINED_TAGS = [
  "Work",
  "Personal",
  "Creative",
  "Technical",
  "Learning",
  "Planning",
  "Brainstorming",
  "Research",
  "Coding",
  "Writing",
  "Health",
  "Finance",
  "Travel",
  "Cooking",
  "Entertainment",
]

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY)
    const savedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY)

    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          tags: session.tags || [],
          files: session.files || [],
        }))
        setSessions(parsedSessions)

        if (savedCurrentId && parsedSessions.find((s: ChatSession) => s.id === savedCurrentId)) {
          setCurrentSessionId(savedCurrentId)
        } else if (parsedSessions.length > 0) {
          setCurrentSessionId(parsedSessions[0].id)
        } else {
          const initialSession = createInitialSession()
          setSessions([initialSession])
          setCurrentSessionId(initialSession.id)
        }
      } catch (error) {
        console.error("Failed to load sessions:", error)
        const initialSession = createInitialSession()
        setSessions([initialSession])
        setCurrentSessionId(initialSession.id)
      }
    } else {
      const initialSession = createInitialSession()
      setSessions([initialSession])
      setCurrentSessionId(initialSession.id)
    }
  }, [])

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
    }
  }, [sessions])

  // Save current session ID
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId)
    }
  }, [currentSessionId])

  const createInitialSession = (): ChatSession => ({
    id: generateSessionId(),
    title: "New Chat",
    messages: [],
    tags: [],
    files: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const createSession = (title = "New Chat", tags: string[] = []): string => {
    const newSession: ChatSession = {
      id: generateSessionId(),
      title,
      messages: [],
      tags,
      files: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setSessions((prev) => [newSession, ...prev])
    return newSession.id
  }

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))

    if (sessionId === currentSessionId) {
      const remainingSessions = sessions.filter((s) => s.id !== sessionId)
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id)
      } else {
        const newSessionId = createSession()
        setCurrentSessionId(newSessionId)
      }
    }
  }

  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, title, updatedAt: new Date() } : session)),
    )
  }

  const updateSessionTags = (sessionId: string, tags: string[]) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, tags, updatedAt: new Date() } : session)),
    )
  }

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, messages, updatedAt: new Date() } : session)),
    )
  }

  const addFileToSession = (sessionId: string, file: FileAttachment) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              files: [...session.files, file],
              updatedAt: new Date(),
            }
          : session,
      ),
    )
  }

  const getCurrentSession = () => {
    return sessions.find((session) => session.id === currentSessionId)
  }

  const getAllTags = () => {
    const allTags = new Set<string>()
    sessions.forEach((session) => {
      session.tags.forEach((tag) => allTags.add(tag))
    })
    return Array.from(allTags).sort()
  }

  const getSessionsByTag = (tag: string) => {
    return sessions.filter((session) => session.tags.includes(tag))
  }

  return {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    switchSession,
    updateSessionTitle,
    updateSessionTags,
    updateSessionMessages,
    addFileToSession,
    getCurrentSession,
    getAllTags,
    getSessionsByTag,
  }
}
