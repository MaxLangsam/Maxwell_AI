"use client"

import { useState } from "react"
import { StickyNote, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NotesPanel } from "./notes-panel"

interface NotesButtonProps {
  userId: string
}

export function NotesButton({ userId }: NotesButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
          <StickyNote size={16} />
          <span className="sr-only">Notes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex items-center justify-between">
          <div>
            <DialogTitle>Notes</DialogTitle>
            <DialogDescription>Create and manage your notes</DialogDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto mt-4">
          <NotesPanel userId={userId} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
