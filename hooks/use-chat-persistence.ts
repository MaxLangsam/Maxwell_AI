"use client"

import { useEffect } from "react"
import type { Message } from "ai"

export function useChatPersistence(
  messages: Message[],
  setMessages: (messages: Message[]) => void,
  storageKey = "chat-messages",
) {
  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(storageKey)
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages)
        }
      } catch (error) {
        console.error("Failed to load chat history:", error)
        localStorage.removeItem(storageKey) // Clean up corrupted data
      }
    }
  }, [setMessages, storageKey])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    }
  }, [messages, storageKey])

  // Clear chat history
  const clearHistory = () => {
    localStorage.removeItem(storageKey)
    setMessages([])
  }

  return { clearHistory }
}
