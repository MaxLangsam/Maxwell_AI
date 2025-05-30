import { createServerClient } from "@/lib/supabase/server"

export class NoteService {
  async getNotes(userId: string, type?: string, search?: string) {
    try {
      const supabase = createServerClient()

      let query = supabase.from("notes").select("*").eq("user_id", userId).order("created_at", { ascending: false })

      if (type) {
        query = query.eq("type", type)
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
      }

      const { data, error } = await query

      if (error) {
        if (error.message.includes("does not exist")) {
          console.warn("Notes table does not exist yet. Please run the database migrations.")
          return []
        }
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error fetching notes:", error)
      return []
    }
  }

  // Other methods with similar error handling...
}
