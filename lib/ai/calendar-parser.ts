export interface ParsedCalendarEvent {
  title: string
  startTime: string
  endTime: string
  description?: string
  location?: string
  attendees?: string[]
  duration?: number
}

export class CalendarParser {
  parseEventFromText(input: string): ParsedCalendarEvent | null {
    const lowercaseInput = input.toLowerCase()

    // Extract title (everything before time/date indicators)
    const title = this.extractTitle(input)
    if (!title) return null

    // Extract date and time
    const dateTime = this.extractDateTime(input)
    if (!dateTime) return null

    // Extract duration
    const duration = this.extractDuration(input) || 60 // Default 1 hour

    // Calculate end time
    const startTime = new Date(dateTime)
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

    // Extract additional details
    const location = this.extractLocation(input)
    const attendees = this.extractAttendees(input)
    const description = this.extractDescription(input)

    return {
      title,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      location,
      attendees,
      description,
    }
  }

  private extractTitle(input: string): string | null {
    // Remove common scheduling words and extract the main title
    const cleanInput = input
      .replace(/(schedule|book|add|create|set up|plan)/gi, "")
      .replace(/(meeting|appointment|call|event)/gi, "")
      .replace(/(with|at|on|for|from|to)/gi, "")
      .trim()

    // Look for quoted titles
    const quotedMatch = input.match(/"([^"]+)"/i)
    if (quotedMatch) return quotedMatch[1]

    // Extract title before time indicators
    const timeIndicators =
      /(at|on|from|tomorrow|today|next|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}:\d{2}|\d{1,2}(am|pm))/i
    const beforeTime = input.split(timeIndicators)[0]

    if (beforeTime.trim().length > 0) {
      return beforeTime.replace(/(schedule|book|add|create|set up|plan|meeting|appointment|call|event)/gi, "").trim()
    }

    return cleanInput || null
  }

  private extractDateTime(input: string): string | null {
    const now = new Date()

    // Handle relative dates
    if (input.includes("today")) {
      const time = this.extractTime(input)
      if (time) {
        const today = new Date()
        const [hours, minutes] = this.parseTime(time)
        today.setHours(hours, minutes, 0, 0)
        return today.toISOString()
      }
    }

    if (input.includes("tomorrow")) {
      const time = this.extractTime(input)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      if (time) {
        const [hours, minutes] = this.parseTime(time)
        tomorrow.setHours(hours, minutes, 0, 0)
      } else {
        tomorrow.setHours(9, 0, 0, 0) // Default to 9 AM
      }
      return tomorrow.toISOString()
    }

    // Handle specific days of the week
    const dayMatch = input.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)
    if (dayMatch) {
      const targetDay = dayMatch[1].toLowerCase()
      const targetDate = this.getNextWeekday(targetDay)
      const time = this.extractTime(input)

      if (time) {
        const [hours, minutes] = this.parseTime(time)
        targetDate.setHours(hours, minutes, 0, 0)
      } else {
        targetDate.setHours(9, 0, 0, 0) // Default to 9 AM
      }
      return targetDate.toISOString()
    }

    // Handle specific dates (MM/DD or DD/MM)
    const dateMatch = input.match(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/i)
    if (dateMatch) {
      const month = Number.parseInt(dateMatch[1]) - 1 // JavaScript months are 0-indexed
      const day = Number.parseInt(dateMatch[2])
      const year = dateMatch[3] ? Number.parseInt(dateMatch[3]) : now.getFullYear()

      const date = new Date(year, month, day)
      const time = this.extractTime(input)

      if (time) {
        const [hours, minutes] = this.parseTime(time)
        date.setHours(hours, minutes, 0, 0)
      } else {
        date.setHours(9, 0, 0, 0) // Default to 9 AM
      }
      return date.toISOString()
    }

    // Handle "next week", "next month", etc.
    if (input.includes("next week")) {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextWeek.setHours(9, 0, 0, 0)
      return nextWeek.toISOString()
    }

    return null
  }

  private extractTime(input: string): string | null {
    // Match various time formats
    const timeMatch = input.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i) || input.match(/(\d{1,2})\s*(am|pm)/i)

    if (timeMatch) {
      return timeMatch[0]
    }

    return null
  }

  private parseTime(timeStr: string): [number, number] {
    const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)

    if (!match) return [9, 0] // Default to 9 AM

    let hours = Number.parseInt(match[1])
    const minutes = Number.parseInt(match[2] || "0")
    const period = match[3]?.toLowerCase()

    if (period === "pm" && hours !== 12) {
      hours += 12
    } else if (period === "am" && hours === 12) {
      hours = 0
    }

    return [hours, minutes]
  }

  private getNextWeekday(dayName: string): Date {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const targetDay = days.indexOf(dayName.toLowerCase())
    const today = new Date()
    const currentDay = today.getDay()

    let daysUntilTarget = targetDay - currentDay
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7 // Next week
    }

    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysUntilTarget)
    return targetDate
  }

  private extractDuration(input: string): number | null {
    // Look for duration patterns
    const durationMatch =
      input.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/i) || input.match(/(half|quarter)\s*(hour)/i)

    if (durationMatch) {
      const amount = durationMatch[1]
      const unit = durationMatch[2]?.toLowerCase()

      if (amount === "half") return 30
      if (amount === "quarter") return 15

      const numAmount = Number.parseInt(amount)

      if (unit?.includes("hour")) return numAmount * 60
      if (unit?.includes("min")) return numAmount

      return numAmount
    }

    // Look for time ranges (e.g., "from 2pm to 4pm")
    const rangeMatch = input.match(/from\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
    if (rangeMatch) {
      const startTime = this.parseTime(rangeMatch[1])
      const endTime = this.parseTime(rangeMatch[2])

      const startMinutes = startTime[0] * 60 + startTime[1]
      const endMinutes = endTime[0] * 60 + endTime[1]

      return endMinutes - startMinutes
    }

    return null
  }

  private extractLocation(input: string): string | null {
    // Look for location indicators
    const locationMatch =
      input.match(/(?:at|in|@)\s+([^,\n]+?)(?:\s+(?:with|on|from|to|at \d)|$)/i) ||
      input.match(/location:\s*([^,\n]+)/i)

    if (locationMatch) {
      return locationMatch[1].trim()
    }

    return null
  }

  private extractAttendees(input: string): string[] {
    const attendees: string[] = []

    // Look for "with" patterns
    const withMatch = input.match(/with\s+([^,\n]+?)(?:\s+(?:at|on|from|to)|$)/i)
    if (withMatch) {
      const people = withMatch[1]
        .split(/\s+and\s+|\s*,\s*/)
        .map((person) => person.trim())
        .filter((person) => person.length > 0)

      attendees.push(...people)
    }

    // Look for email patterns
    const emailMatches = input.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g)
    if (emailMatches) {
      attendees.push(...emailMatches)
    }

    return [...new Set(attendees)] // Remove duplicates
  }

  private extractDescription(input: string): string | null {
    // Look for description indicators
    const descMatch = input.match(/(?:about|regarding|re:|description:)\s*([^,\n]+)/i)

    if (descMatch) {
      return descMatch[1].trim()
    }

    return null
  }
}
