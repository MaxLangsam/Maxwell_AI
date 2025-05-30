"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarService } from "@/lib/services/calendar-service"
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type CalendarEvent = Database["public"]["Tables"]["calendar_events"]["Row"]

interface CalendarViewProps {
  userId: string
}

export function CalendarView({ userId }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("day")
  const [isLoading, setIsLoading] = useState(true)

  const calendarService = new CalendarService()

  useEffect(() => {
    loadEvents()
  }, [currentDate, view, userId])

  const loadEvents = async () => {
    setIsLoading(true)
    try {
      let startDate: string
      let endDate: string

      if (view === "day") {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toISOString()
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).toISOString()
      } else if (view === "week") {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 7)

        startDate = startOfWeek.toISOString()
        endDate = endOfWeek.toISOString()
      } else {
        // month
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString()
      }

      const fetchedEvents = await calendarService.getEvents(userId, startDate, endDate)
      setEvents(fetchedEvents)
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)

    if (view === "day") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (view === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    }

    setCurrentDate(newDate)
  }

  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: view === "day" ? "long" : undefined,
      year: "numeric",
      month: "long",
      day: view === "day" ? "numeric" : undefined,
    }

    return currentDate.toLocaleDateString([], options)
  }

  const getEventsByDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const renderDayView = () => {
    const dayEvents = getEventsByDay(currentDate)

    return (
      <div className="space-y-2">
        {dayEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Calendar size={48} className="mx-auto mb-2 opacity-50" />
            <p>No events scheduled for today</p>
          </div>
        ) : (
          dayEvents.map((event) => (
            <Card key={event.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {calendarService.formatEventTime(event)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {event.location}
                        </div>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {event.attendees.length} attendee{event.attendees.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                    {event.description && <p className="text-sm text-gray-600 mt-2">{event.description}</p>}
                  </div>
                  <Badge variant="outline">{calendarService.getDuration(event)} min</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsByDay(day)
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <div key={index} className={`border rounded-lg p-2 ${isToday ? "bg-blue-50 border-blue-200" : ""}`}>
              <div className="text-center mb-2">
                <div className="text-xs text-gray-500">{day.toLocaleDateString([], { weekday: "short" })}</div>
                <div className={`text-sm font-medium ${isToday ? "text-blue-600" : ""}`}>
                  {day.toLocaleDateString([], { day: "numeric" })}
                </div>
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="text-xs p-1 bg-blue-100 rounded truncate">
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg">
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("day")}
                className="rounded-r-none"
              >
                Day
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className="rounded-none border-x-0"
              >
                Week
              </Button>
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className="rounded-l-none"
              >
                Month
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
              <ChevronLeft size={16} />
            </Button>
            <h2 className="text-lg font-semibold min-w-[200px] text-center">{formatDateHeader()}</h2>
            <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
              <ChevronRight size={16} />
            </Button>
          </div>
          <Button size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading events...</p>
          </div>
        ) : view === "day" ? (
          renderDayView()
        ) : view === "week" ? (
          renderWeekView()
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Month view coming soon!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
