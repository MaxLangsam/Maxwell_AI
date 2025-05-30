"use client"

import { CalendarView } from "@/components/calendar/calendar-view"
import { UpcomingEvents } from "@/components/calendar/upcoming-events"
import { FreeTimeFinder } from "@/components/calendar/free-time-finder"
import { QuickActions } from "@/components/dashboard/quick-actions"

interface DashboardProps {
  userId: string
}

export function Dashboard({ userId }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-2">
        <CalendarView userId={userId} />
      </div>

      <div className="space-y-6">
        <UpcomingEvents userId={userId} />
        <FreeTimeFinder userId={userId} />
        <QuickActions userId={userId} />
      </div>
    </div>
  )
}
