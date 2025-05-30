"use client"

import { useState, useEffect } from "react"

export interface Settings {
  theme: "light" | "dark" | "system"
  fontSize: number
  autoScrollToBottom: boolean
  showCodeLineNumbers: boolean
  enableSyntaxHighlighting: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
  language: string
}

const defaultSettings: Settings = {
  theme: "system",
  fontSize: 14,
  autoScrollToBottom: true,
  showCodeLineNumbers: true,
  enableSyntaxHighlighting: true,
  soundEnabled: true,
  notificationsEnabled: true,
  language: "en",
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  useEffect(() => {
    const savedSettings = localStorage.getItem("maxwell-settings")
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("maxwell-settings", JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
