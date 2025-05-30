"use client"

import { useState, useEffect } from "react"
import { nanoid } from "nanoid"

export interface Note {
  id: string
  title: string
  content: string
  category: string
  createdAt: Date
  updatedAt: Date
}

interface CreateNoteParams {
  title: string
  content: string
  category?: string
}

interface UpdateNoteParams {
  title?: string
  content?: string
  category?: string
}

const LOCAL_STORAGE_KEY_PREFIX = "maxwell-notes-"

export function useNotes(userId: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${userId || "anonymous"}`

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(storageKey)
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }))
        setNotes(parsedNotes)
      } catch (error) {
        console.error("Error parsing saved notes:", error)
        setNotes([])
      }
    }
  }, [storageKey])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(notes))
    } else {
      localStorage.removeItem(storageKey)
    }
  }, [notes, storageKey])

  const createNote = (params: CreateNoteParams): Note => {
    const newNote: Note = {
      id: nanoid(),
      title: params.title,
      content: params.content,
      category: params.category || "general",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setNotes((prev) => [newNote, ...prev])
    return newNote
  }

  const updateNote = (noteId: string, params: UpdateNoteParams): Note | null => {
    let updatedNote: Note | null = null

    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId) {
          updatedNote = {
            ...note,
            ...params,
            updatedAt: new Date(),
          }
          return updatedNote
        }
        return note
      }),
    )

    return updatedNote
  }

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
  }

  const getNoteById = (noteId: string): Note | undefined => {
    return notes.find((note) => note.id === noteId)
  }

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
  }
}
