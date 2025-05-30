"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Message } from "ai"

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Use refs to track previous values and prevent unnecessary updates
  const prevMessagesRef = useRef<Record<string, Message[]>>({})
  const isMountedRef = useRef(false)

  // Load sessions from localStorage on mount
  useEffect(() => {
    if (isMountedRef.current) return
    isMountedRef.current = true

    try {
      const savedSessions = localStorage.getItem("maxwell-chat-sessions")
      const savedCurrentId = localStorage.getItem("maxwell-current-session")

      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
        }))
        setSessions(parsedSessions)

        // Initialize the previous messages ref
        parsedSessions.forEach((session: ChatSession) => {
          prevMessagesRef.current[session.id] = [...session.messages]
        })

        if (savedCurrentId && parsedSessions.find((s: ChatSession) => s.id === savedCurrentId)) {
          setCurrentSessionId(savedCurrentId)
        } else if (parsedSessions.length > 0) {
          setCurrentSessionId(parsedSessions[0].id)
        }
      } else {
        // Create initial session if none exists
        const initialSession = createInitialSession()
        setSessions([initialSession])
        setCurrentSessionId(initialSession.id)
        prevMessagesRef.current[initialSession.id] = []
      }

      setIsInitialized(true)
    } catch (error) {
      console.error("Error loading chat sessions:", error)
      // Fallback to a clean state
      const initialSession = createInitialSession()
      setSessions([initialSession])
      setCurrentSessionId(initialSession.id)
      prevMessagesRef.current[initialSession.id] = []
      setIsInitialized(true)
    }
  }, [])

  // Save sessions to localStorage when they change (but only after initialization)
  useEffect(() => {
    if (!isInitialized || !isMountedRef.current) return

    try {
      if (sessions.length > 0) {
        localStorage.setItem("maxwell-chat-sessions", JSON.stringify(sessions))
      }
    } catch (error) {
      console.error("Error saving chat sessions:", error)
    }
  }, [sessions, isInitialized])

  // Save current session ID (but only after initialization)
  useEffect(() => {
    if (!isInitialized || !isMountedRef.current || !currentSessionId) return

    try {
      localStorage.setItem("maxwell-current-session", currentSessionId)
    } catch (error) {
      console.error("Error saving current session ID:", error)
    }
  }, [currentSessionId, isInitialized])

  const createInitialSession = useCallback(
    (): ChatSession => ({
      id: `session-${Date.now()}`,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    }),
    [],
  )

  const createSession = useCallback((): string => {
    const newSession = createInitialSession()
    setSessions((prev) => [newSession, ...prev])
    prevMessagesRef.current[newSession.id] = []
    return newSession.id
  }, [createInitialSession])

  const switchSession = useCallback(
    (sessionId: string) => {
      if (sessionId !== currentSessionId) {
        setCurrentSessionId(sessionId)
      }
    },
    [currentSessionId],
  )

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    // Clean up the messages ref
    const newPrevMessages = { ...prevMessagesRef.current }
    delete newPrevMessages[sessionId]
    prevMessagesRef.current = newPrevMessages
  }, [])

  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, title, updatedAt: new Date() } : session)),
    )
  }, [])

  // Optimized message update function to prevent infinite loops
  const updateSessionMessages = useCallback((sessionId: string, messages: Message[]) => {
    // Skip update if messages haven't changed
    const prevMessages = prevMessagesRef.current[sessionId] || []

    // Deep comparison of messages
    const messagesChanged = JSON.stringify(prevMessages) !== JSON.stringify(messages)

    if (!messagesChanged) return

    // Update the ref first
    prevMessagesRef.current[sessionId] = [...messages]

    // Then update the state
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          return { ...session, messages: [...messages], updatedAt: new Date() }
        }
        return session
      }),
    )
  }, [])

  const updateSessionTags = useCallback((sessionId: string, tags: string[]) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, tags, updatedAt: new Date() } : session)),
    )
  }, [])

  const getCurrentSession = useCallback(() => {
    return sessions.find((session) => session.id === currentSessionId)
  }, [sessions, currentSessionId])

  const getAllTags = useCallback(() => {
    const allTags = sessions.flatMap((session) => session.tags)
    return [...new Set(allTags)]
  }, [sessions])

  return {
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
  }
}
