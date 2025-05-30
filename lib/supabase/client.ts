import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

export const createClient = () => {
  try {
    // Only use environment variables - never hardcode keys
    return createClientComponentClient<Database>()
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    throw error
  }
}

export type SupabaseClient = ReturnType<typeof createClient>
