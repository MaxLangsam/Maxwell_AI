import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Reminder = Database["public"]["Tables"]["reminders"]["Row"]
type ReminderInsert = Database["public"]["Tables"]["reminders"]["Insert"]

export class ReminderService {
  private supabase = createClient()

  async addReminder(reminder: Omit<ReminderInsert, "user_id">, userId: string): Promise<Reminder | null> {
    const { data, error } = await this.supabase
      .from("reminders")
      .insert({ ...reminder, user_id: userId })
      .select()
      .single()

    if (error) {
      console.error("Error adding reminder:", error)
      return null
    }

    return data
  }

  async getActiveReminders(userId: string): Promise<Reminder[]> {
    const { data, error } = await this.supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("reminder_time", { ascending: true })

    if (error) {
      console.error("Error fetching reminders:", error)
      return []
    }

    return data || []
  }

  async getDueReminders(userId: string): Promise<Reminder[]> {
    const now = new Date().toISOString()

    const { data, error } = await this.supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .lte("reminder_time", now)
      .order("reminder_time", { ascending: true })

    if (error) {
      console.error("Error fetching due reminders:", error)
      return []
    }

    return data || []
  }

  async snoozeReminder(id: string, newTime: string): Promise<Reminder | null> {
    const { data, error } = await this.supabase
      .from("reminders")
      .update({
        reminder_time: newTime,
        status: "active",
        snooze_count: this.supabase.rpc("increment_snooze_count", { reminder_id: id }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error snoozing reminder:", error)
      return null
    }

    return data
  }

  async completeReminder(id: string): Promise<Reminder | null> {
    const { data, error } = await this.supabase
      .from("reminders")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error completing reminder:", error)
      return null
    }

    return data
  }
}
