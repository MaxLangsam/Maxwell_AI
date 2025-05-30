"use client"

import { useState } from "react"
import { Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { JournalInsights } from "@/components/journal/journal-insights"

interface InsightsButtonProps {
  userId: string
}

export function InsightsButton({ userId }: InsightsButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Brain size={18} />
          <span className="sr-only">Journal Insights</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Journal Insights
          </DialogTitle>
          <DialogDescription>AI-powered analysis of your journal entries and conversations</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <JournalInsights userId={userId} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
