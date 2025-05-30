"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle, Clock, FileText } from "lucide-react"
import { TaskService } from "@/lib/services/task-service"
import { ReminderService } from "@/lib/services/reminder-service"
import { NoteService } from "@/lib/services/note-service"

interface QuickActionsProps {
  userId: string
}

export function QuickActions({ userId }: QuickActionsProps) {
  const [quickInput, setQuickInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const taskService = new TaskService()
  const reminderService = new ReminderService()
  const noteService = new NoteService()

  const handleQuickAction = async (type: "task" | "reminder" | "note") => {
    if (!quickInput.trim()) return

    setIsLoading(true)
    try {
      switch (type) {
        case "task":
          await taskService.addTask(
            {
              title: quickInput,
              priority: "medium",
              status: "pending",
              tags: [],
            },
            userId,
          )
          break
        case "reminder":
          await reminderService.addReminder(
            {
              title: quickInput,
              reminder_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
              status: "active",
              snooze_count: 0,
            },
            userId,
          )
          break
        case "note":
          await noteService.addNote(
            {
              title: quickInput.slice(0, 50),
              content: quickInput,
              type: "note",
              tags: [],
            },
            userId,
          )
          break
      }
      setQuickInput("")
    } catch (error) {
      console.error("Error creating quick action:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus size={20} />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="What would you like to add?"
            className="flex-1"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("task")}
            disabled={!quickInput.trim() || isLoading}
            className="flex items-center gap-1"
          >
            <CheckCircle size={14} />
            Task
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("reminder")}
            disabled={!quickInput.trim() || isLoading}
            className="flex items-center gap-1"
          >
            <Clock size={14} />
            Reminder
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction("note")}
            disabled={!quickInput.trim() || isLoading}
            className="flex items-center gap-1"
          >
            <FileText size={14} />
            Note
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Natural Language Examples:</h4>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              "Remind me to call mom at 3pm"
            </Badge>
            <Badge variant="secondary" className="text-xs">
              "🔥 urgent: finish presentation"
            </Badge>
            <Badge variant="secondary" className="text-xs">
              "Note: great idea for weekend project"
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
