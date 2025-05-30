"use client"

import { useState, useEffect } from "react"

interface Settings {
  language: string
  codeSyntaxHighlighting: boolean
  autoScrollToBottom: boolean
  fontSize: number
  soundEffects: boolean
  desktopNotifications: boolean
  soundVolume: number
}

const DEFAULT_SETTINGS: Settings = {
  language: "en",
  codeSyntaxHighlighting: true,
  autoScrollToBottom: true,
  fontSize: 16,
  soundEffects: false,
  desktopNotifications: false,
  soundVolume: 50,
}

const LOCAL_STORAGE_KEY = "maxwell-settings"

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings })
      } catch (error) {
        console.error("Error parsing saved settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return {
    settings,
    updateSettings,
  }
}
