"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarService } from "@/lib/services/calendar-service"
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type CalendarEvent = Database["public"]["Tables"]["calendar_events"]["Row"]

interface UpcomingEventsProps {
  userId: string
  limit?: number
}

export function UpcomingEvents({ userId, limit = 5 }: UpcomingEventsProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const calendarService = new CalendarService()

  useEffect(() => {
    loadUpcomingEvents()
  }, [userId])

  const loadUpcomingEvents = async () => {
    setIsLoading(true)
    try {
      const upcomingEvents = await calendarService.getUpcomingEvents(userId, 7)
      setEvents(upcomingEvents.slice(0, limit))
    } catch (error) {
      console.error("Error loading upcoming events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTimeUntilEvent = (eventTime: string): string => {
    const now = new Date()
    const event = new Date(eventTime)
    const diffMs = event.getTime() - now.getTime()

    if (diffMs < 0) return "Past"

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours < 1) {
      return `${diffMinutes}m`
    } else if (diffHours < 24) {
      return `${diffHours}h ${diffMinutes}m`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d`
    }
  }

  const isEventSoon = (eventTime: string): boolean => {
    const now = new Date()
    const event = new Date(eventTime)
    const diffMs = event.getTime() - now.getTime()
    return diffMs > 0 && diffMs < 30 * 60 * 1000 // 30 minutes
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading events...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={20} />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const timeUntil = getTimeUntilEvent(event.start_time)
              const isSoon = isEventSoon(event.start_time)

              return (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border ${isSoon ? "border-orange-200 bg-orange-50" : "border-gray-200"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{event.title}</h3>
                        {isSoon && <AlertCircle size={14} className="text-orange-500" />}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(event.start_time).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="truncate max-w-[100px]">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Badge variant={isSoon ? "destructive" : "secondary"} className="text-xs">
                      {timeUntil}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
