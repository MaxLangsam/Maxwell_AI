"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CalendarService } from "@/lib/services/calendar-service"
import { Clock, Search } from "lucide-react"

interface FreeTimeFinderProps {
  userId: string
}

export function FreeTimeFinder({ userId }: FreeTimeFinderProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [duration, setDuration] = useState(60)
  const [freeSlots, setFreeSlots] = useState<{ start: string; end: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const calendarService = new CalendarService()

  const findFreeTime = async () => {
    setIsLoading(true)
    try {
      const slots = await calendarService.findFreeTime(userId, selectedDate, duration)
      setFreeSlots(slots)
    } catch (error) {
      console.error("Error finding free time:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeSlot = (start: string, end: string): string => {
    const startTime = new Date(start).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    const endTime = new Date(end).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    return `${startTime} - ${endTime}`
  }

  const getSlotDuration = (start: string, end: string): number => {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search size={20} />
          Find Free Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number.parseInt(e.target.value))}
              min={15}
              step={15}
            />
          </div>
        </div>

        <Button onClick={findFreeTime} disabled={isLoading} className="w-full">
          {isLoading ? "Searching..." : "Find Free Time"}
        </Button>

        {freeSlots.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Available Time Slots:</h4>
            <div className="space-y-2">
              {freeSlots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span className="text-sm">{formatTimeSlot(slot.start, slot.end)}</span>
                  </div>
                  <Badge variant="outline">{getSlotDuration(slot.start, slot.end)} min</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {freeSlots.length === 0 && !isLoading && selectedDate && (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">No free time slots found for the selected duration.</p>
            <p className="text-xs mt-1">Try a shorter duration or different date.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
