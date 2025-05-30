import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Memory = Database["public"]["Tables"]["memories"]["Row"]
type MemoryInsert = Database["public"]["Tables"]["memories"]["Insert"]

export class MemoryService {
  private supabase = createClient()

  async addMemory(memory: Omit<MemoryInsert, "user_id">, userId: string): Promise<Memory | null> {
    const { data, error } = await this.supabase
      .from("memories")
      .insert({ ...memory, user_id: userId })
      .select()
      .single()

    if (error) {
      console.error("Error adding memory:", error)
      return null
    }

    return data
  }

  async getMemories(userId: string, type?: Memory["type"]): Promise<Memory[]> {
    let query = this.supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .order("importance", { ascending: false })
      .order("updated_at", { ascending: false })

    if (type) {
      query = query.eq("type", type)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching memories:", error)
      return []
    }

    return data || []
  }

  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | null> {
    const { data, error } = await this.supabase.from("memories").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating memory:", error)
      return null
    }

    return data
  }

  async deleteMemory(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("memories").delete().eq("id", id)

    if (error) {
      console.error("Error deleting memory:", error)
      return false
    }

    return true
  }

  async forgetTopic(userId: string, topic: string): Promise<boolean> {
    const { error } = await this.supabase.from("memories").delete().eq("user_id", userId).ilike("content", `%${topic}%`)

    if (error) {
      console.error("Error forgetting topic:", error)
      return false
    }

    return true
  }

  async getRelevantMemories(userId: string, context: string, limit = 10): Promise<Memory[]> {
    // Simple text search - in production, you'd use vector similarity
    const { data, error } = await this.supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .textSearch("content", context)
      .order("importance", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching relevant memories:", error)
      return []
    }

    return data || []
  }
}
