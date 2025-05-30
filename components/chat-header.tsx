"use client"

import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  hasMessages: boolean
  onClearHistory: () => void
}

export function ChatHeader({ hasMessages, onClearHistory }: ChatHeaderProps) {
  if (hasMessages) {
    return (
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-xs text-muted-foreground">Chat History</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="h-6 px-2 text-xs hover:bg-red-50 hover:text-red-600"
        >
          Clear History
        </Button>
      </div>
    )
  }

  return (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">Personal AI Assistant</h1>
      <p className="text-muted-foreground text-sm">
        Your personal AI chatbot powered by <span className="text-foreground">OpenAI GPT-4o-mini</span> and the{" "}
        <span className="text-foreground">Vercel AI SDK</span>.
      </p>
      <p className="text-muted-foreground text-sm">Ask me anything - I'm here to help!</p>
      <p className="text-xs text-muted-foreground">Your conversations are automatically saved locally.</p>
    </header>
  )
}
