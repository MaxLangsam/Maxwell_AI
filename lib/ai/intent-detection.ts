export interface Intent {
  type: "task" | "reminder" | "note" | "calendar" | "memory" | "search" | "general"
  confidence: number
  entities: Record<string, any>
  action?: string
}

export class IntentDetector {
  detectIntent(input: string): Intent {
    const lowercaseInput = input.toLowerCase()

    // Calendar-related patterns (enhanced)
    if (
      this.matchesPattern(lowercaseInput, [
        "schedule",
        "book",
        "add event",
        "create event",
        "meeting",
        "appointment",
        "calendar",
        "set up meeting",
        "plan meeting",
        "block time",
        "reserve time",
        "what's my schedule",
        "show my calendar",
        "free time",
        "available",
        "when am i free",
        "check conflicts",
      ])
    ) {
      return {
        type: "calendar",
        confidence: 0.9,
        entities: this.extractCalendarEntities(input),
        action: this.detectCalendarAction(lowercaseInput),
      }
    }

    // Task-related patterns
    if (
      this.matchesPattern(lowercaseInput, [
        "add task",
        "create task",
        "new task",
        "todo",
        "need to do",
        "remind me to",
        "i should",
        "i need to",
        "task:",
      ])
    ) {
      return {
        type: "task",
        confidence: 0.9,
        entities: this.extractTaskEntities(input),
        action: "create",
      }
    }

    // Reminder patterns
    if (
      this.matchesPattern(lowercaseInput, [
        "remind me",
        "set reminder",
        "reminder",
        "alert me",
        "don't forget",
        "remember to tell me",
      ])
    ) {
      return {
        type: "reminder",
        confidence: 0.9,
        entities: this.extractReminderEntities(input),
        action: "create",
      }
    }

    // Note-taking patterns
    if (
      this.matchesPattern(lowercaseInput, [
        "note:",
        "take note",
        "write down",
        "remember this",
        "journal",
        "log this",
        "save this",
      ])
    ) {
      return {
        type: "note",
        confidence: 0.9,
        entities: this.extractNoteEntities(input),
        action: "create",
      }
    }

    // Memory/forget patterns
    if (this.matchesPattern(lowercaseInput, ["/forget", "forget about", "delete memory"])) {
      return {
        type: "memory",
        confidence: 0.95,
        entities: this.extractForgetEntities(input),
        action: "forget",
      }
    }

    // Search patterns
    if (
      this.matchesPattern(lowercaseInput, [
        "search",
        "find",
        "look for",
        "show me",
        "what did i",
        "when did i",
        "where is",
      ])
    ) {
      return {
        type: "search",
        confidence: 0.8,
        entities: this.extractSearchEntities(input),
        action: "search",
      }
    }

    // Default to general conversation
    return {
      type: "general",
      confidence: 0.5,
      entities: {},
      action: "chat",
    }
  }

  private matchesPattern(input: string, patterns: string[]): boolean {
    return patterns.some((pattern) => input.includes(pattern))
  }

  private detectCalendarAction(input: string): string {
    if (
      input.includes("what's my") ||
      input.includes("show me") ||
      input.includes("check") ||
      input.includes("view") ||
      input.includes("see my")
    ) {
      return "view"
    }
    if (input.includes("free time") || input.includes("available") || input.includes("when am i free")) {
      return "find_free_time"
    }
    if (input.includes("conflicts") || input.includes("check conflicts")) {
      return "check_conflicts"
    }
    if (
      input.includes("schedule") ||
      input.includes("book") ||
      input.includes("add") ||
      input.includes("create") ||
      input.includes("set up") ||
      input.includes("plan")
    ) {
      return "create"
    }
    return "view"
  }

  private extractCalendarEntities(input: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Extract title
    entities.title = this.extractEventTitle(input)

    // Extract date and time
    const dateTime = this.extractDateTime(input)
    if (dateTime) {
      entities.startTime = dateTime
    }

    // Extract duration
    const duration = this.extractDuration(input)
    if (duration) {
      entities.duration = duration
    }

    // Extract location
    const location = this.extractLocation(input)
    if (location) {
      entities.location = location
    }

    // Extract attendees
    const attendees = this.extractAttendees(input)
    if (attendees.length > 0) {
      entities.attendees = attendees
    }

    // Extract description
    const description = this.extractDescription(input)
    if (description) {
      entities.description = description
    }

    return entities
  }

  private extractEventTitle(input: string): string {
    // Remove scheduling keywords and extract the main title
    let title = input
      .replace(/(schedule|book|add|create|set up|plan|meeting|appointment|event|call)/gi, "")
      .replace(/(with|at|on|for|from|to|in|@)/gi, "")
      .trim()

    // Look for quoted titles
    const quotedMatch = input.match(/"([^"]+)"/i)
    if (quotedMatch) return quotedMatch[1]

    // Extract title before time/location indicators
    const indicators =
      /(at|on|from|tomorrow|today|next|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}:\d{2}|\d{1,2}(am|pm)|with)/i
    const beforeIndicator = input.split(indicators)[0]

    if (beforeIndicator.trim().length > 0) {
      title = beforeIndicator
        .replace(/(schedule|book|add|create|set up|plan|meeting|appointment|event|call)/gi, "")
        .trim()
    }

    return title || "Meeting"
  }

  private extractTaskEntities(input: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Extract priority
    if (input.includes("urgent") || input.includes("🔥")) entities.priority = "urgent"
    else if (input.includes("high priority") || input.includes("⚡")) entities.priority = "high"
    else if (input.includes("low priority") || input.includes("💡")) entities.priority = "low"
    else entities.priority = "medium"

    // Extract due date
    const dateMatch = input.match(
      /(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2})/i,
    )
    if (dateMatch) {
      entities.dueDate = this.parseDate(dateMatch[0])
    }

    // Extract task title
    entities.title = input
      .replace(/(add task|create task|new task|todo|task:)/gi, "")
      .replace(/(urgent|high priority|low priority|🔥|⚡|💡)/gi, "")
      .replace(dateMatch?.[0] || "", "")
      .trim()

    return entities
  }

  private extractReminderEntities(input: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Extract time
    const timeMatch = input.match(/(\d{1,2}:\d{2}|\d{1,2}(am|pm)|at \d{1,2}|in \d+ (minutes|hours|days))/i)
    if (timeMatch) {
      entities.time = this.parseTime(timeMatch[0])
    }

    // Extract recurring pattern
    if (input.includes("every day") || input.includes("daily")) entities.recurring = "daily"
    else if (input.includes("every week") || input.includes("weekly")) entities.recurring = "weekly"
    else if (input.includes("every month") || input.includes("monthly")) entities.recurring = "monthly"

    // Extract reminder text
    entities.title = input
      .replace(/(remind me|set reminder|reminder|alert me)/gi, "")
      .replace(timeMatch?.[0] || "", "")
      .replace(/(every day|daily|every week|weekly|every month|monthly)/gi, "")
      .trim()

    return entities
  }

  private extractNoteEntities(input: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Determine note type
    if (input.includes("journal") || input.includes("feeling")) entities.type = "journal"
    else if (input.includes("idea") || input.includes("💡")) entities.type = "idea"
    else entities.type = "note"

    // Extract mood for journal entries
    if (entities.type === "journal") {
      const moodMatch = input.match(/(happy|sad|excited|anxious|grateful|frustrated|calm|energetic)/i)
      if (moodMatch) entities.mood = moodMatch[0].toLowerCase()
    }

    // Extract content
    entities.content = input
      .replace(/(note:|take note|write down|remember this|journal|log this|save this)/gi, "")
      .trim()

    return entities
  }

  private extractForgetEntities(input: string): Record<string, any> {
    const topic = input.replace(/\/forget|forget about|delete memory/gi, "").trim()
    return { topic }
  }

  private extractSearchEntities(input: string): Record<string, any> {
    const query = input.replace(/(search|find|look for|show me|what did i|when did i|where is)/gi, "").trim()
    return { query }
  }

  private extractDateTime(input: string): string | null {
    const now = new Date()

    // Handle relative dates
    if (input.includes("today")) {
      const time = this.extractTime(input)
      if (time) {
        const today = new Date()
        const [hours, minutes] = this.parseTimeString(time)
        today.setHours(hours, minutes, 0, 0)
        return today.toISOString()
      }
    }

    if (input.includes("tomorrow")) {
      const time = this.extractTime(input)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      if (time) {
        const [hours, minutes] = this.parseTimeString(time)
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
        const [hours, minutes] = this.parseTimeString(time)
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
        const [hours, minutes] = this.parseTimeString(time)
        date.setHours(hours, minutes, 0, 0)
      } else {
        date.setHours(9, 0, 0, 0) // Default to 9 AM
      }
      return date.toISOString()
    }

    return null
  }

  private extractTime(input: string): string | null {
    const timeMatch = input.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i) || input.match(/(\d{1,2})\s*(am|pm)/i)
    return timeMatch ? timeMatch[0] : null
  }

  private parseTimeString(timeStr: string): [number, number] {
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

    // Look for time ranges
    const rangeMatch = input.match(/from\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
    if (rangeMatch) {
      const startTime = this.parseTimeString(rangeMatch[1])
      const endTime = this.parseTimeString(rangeMatch[2])

      const startMinutes = startTime[0] * 60 + startTime[1]
      const endMinutes = endTime[0] * 60 + endTime[1]

      return endMinutes - startMinutes
    }

    return null
  }

  private extractLocation(input: string): string | null {
    const locationMatch =
      input.match(/(?:at|in|@)\s+([^,\n]+?)(?:\s+(?:with|on|from|to|at \d)|$)/i) ||
      input.match(/location:\s*([^,\n]+)/i)

    return locationMatch ? locationMatch[1].trim() : null
  }

  private extractAttendees(input: string): string[] {
    const attendees: string[] = []

    const withMatch = input.match(/with\s+([^,\n]+?)(?:\s+(?:at|on|from|to)|$)/i)
    if (withMatch) {
      const people = withMatch[1]
        .split(/\s+and\s+|\s*,\s*/)
        .map((person) => person.trim())
        .filter((person) => person.length > 0)

      attendees.push(...people)
    }

    const emailMatches = input.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g)
    if (emailMatches) {
      attendees.push(...emailMatches)
    }

    return [...new Set(attendees)]
  }

  private extractDescription(input: string): string | null {
    const descMatch = input.match(/(?:about|regarding|re:|description:)\s*([^,\n]+)/i)
    return descMatch ? descMatch[1].trim() : null
  }

  private parseDate(dateStr: string): string {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    switch (dateStr.toLowerCase()) {
      case "today":
        return today.toISOString().split("T")[0]
      case "tomorrow":
        return tomorrow.toISOString().split("T")[0]
      case "next week":
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)
        return nextWeek.toISOString().split("T")[0]
      default:
        return today.toISOString().split("T")[0]
    }
  }

  private parseTime(timeStr: string): string {
    const now = new Date()

    if (timeStr.includes("in")) {
      const match = timeStr.match(/in (\d+) (minutes|hours|days)/)
      if (match) {
        const amount = Number.parseInt(match[1])
        const unit = match[2]

        if (unit === "minutes") now.setMinutes(now.getMinutes() + amount)
        else if (unit === "hours") now.setHours(now.getHours() + amount)
        else if (unit === "days") now.setDate(now.getDate() + amount)
      }
    }

    return now.toISOString()
  }
}
