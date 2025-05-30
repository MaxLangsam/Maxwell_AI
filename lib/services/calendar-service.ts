import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type CalendarEvent = Database["public"]["Tables"]["calendar_events"]["Row"]
type CalendarEventInsert = Database["public"]["Tables"]["calendar_events"]["Insert"]

export class CalendarService {
  private supabase = createClient()

  async addEvent(event: Omit<CalendarEventInsert, "user_id">, userId: string): Promise<CalendarEvent | null> {
    const { data, error } = await this.supabase
      .from("calendar_events")
      .insert({ ...event, user_id: userId })
      .select()
      .single()

    if (error) {
      console.error("Error adding event:", error)
      return null
    }

    return data
  }

  async getEvents(userId: string, startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    let query = this.supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: true })

    if (startDate) {
      query = query.gte("start_time", startDate)
    }

    if (endDate) {
      query = query.lte("start_time", endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching events:", error)
      return []
    }

    return data || []
  }

  async getTodaysEvents(userId: string): Promise<CalendarEvent[]> {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    return this.getEvents(userId, startOfDay, endOfDay)
  }

  async getUpcomingEvents(userId: string, days = 7): Promise<CalendarEvent[]> {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    return this.getEvents(userId, now.toISOString(), futureDate.toISOString())
  }

  async checkConflicts(
    userId: string,
    startTime: string,
    endTime: string,
    excludeEventId?: string,
  ): Promise<CalendarEvent[]> {
    let query = this.supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)

    if (excludeEventId) {
      query = query.neq("id", excludeEventId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error checking conflicts:", error)
      return []
    }

    return data || []
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const { data, error } = await this.supabase
      .from("calendar_events")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating event:", error)
      return null
    }

    return data
  }

  async deleteEvent(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("calendar_events").delete().eq("id", id)

    if (error) {
      console.error("Error deleting event:", error)
      return false
    }

    return true
  }

  async findFreeTime(
    userId: string,
    date: string,
    duration: number,
    workingHours = { start: 9, end: 17 },
  ): Promise<{ start: string; end: string }[]> {
    const events = await this.getEvents(userId, date, date)
    const freeSlots: { start: string; end: string }[] = []

    const dayStart = new Date(date)
    dayStart.setHours(workingHours.start, 0, 0, 0)

    const dayEnd = new Date(date)
    dayEnd.setHours(workingHours.end, 0, 0, 0)

    // Sort events by start time
    const sortedEvents = events.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    let currentTime = dayStart

    for (const event of sortedEvents) {
      const eventStart = new Date(event.start_time)
      const eventEnd = new Date(event.end_time)

      // Check if there's a gap before this event
      if (currentTime < eventStart) {
        const gapDuration = eventStart.getTime() - currentTime.getTime()
        if (gapDuration >= duration * 60 * 1000) {
          // Duration in minutes
          freeSlots.push({
            start: currentTime.toISOString(),
            end: eventStart.toISOString(),
          })
        }
      }

      currentTime = eventEnd > currentTime ? eventEnd : currentTime
    }

    // Check if there's time after the last event
    if (currentTime < dayEnd) {
      const remainingTime = dayEnd.getTime() - currentTime.getTime()
      if (remainingTime >= duration * 60 * 1000) {
        freeSlots.push({
          start: currentTime.toISOString(),
          end: dayEnd.toISOString(),
        })
      }
    }

    return freeSlots
  }

  formatEventTime(event: CalendarEvent): string {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    }

    const startTime = start.toLocaleTimeString([], timeOptions)
    const endTime = end.toLocaleTimeString([], timeOptions)

    // If same day, just show time range
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString([], dateOptions)} ${startTime} - ${endTime}`
    }

    // Multi-day event
    return `${start.toLocaleDateString([], dateOptions)} ${startTime} - ${end.toLocaleDateString([], dateOptions)} ${endTime}`
  }

  getDuration(event: CalendarEvent): number {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)) // Duration in minutes
  }
}
