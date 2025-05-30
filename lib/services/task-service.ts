import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Task = Database["public"]["Tables"]["tasks"]["Row"]
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"]

export class TaskService {
  private supabase = createClient()

  async addTask(task: Omit<TaskInsert, "user_id">, userId: string): Promise<Task | null> {
    const { data, error } = await this.supabase
      .from("tasks")
      .insert({ ...task, user_id: userId })
      .select()
      .single()

    if (error) {
      console.error("Error adding task:", error)
      return null
    }

    return data
  }

  async getTasks(userId: string, status?: Task["status"]): Promise<Task[]> {
    let query = this.supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching tasks:", error)
      return []
    }

    return data || []
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const { data, error } = await this.supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating task:", error)
      return null
    }

    return data
  }

  async completeTask(id: string): Promise<Task | null> {
    return this.updateTask(id, {
      status: "completed",
      completed_at: new Date().toISOString(),
    })
  }

  async deleteTask(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("tasks").delete().eq("id", id)

    if (error) {
      console.error("Error deleting task:", error)
      return false
    }

    return true
  }

  getPriorityEmoji(priority: Task["priority"]): string {
    switch (priority) {
      case "urgent":
        return "🔥"
      case "high":
        return "⚡"
      case "medium":
        return "📋"
      case "low":
        return "💡"
      default:
        return "📋"
    }
  }
}
