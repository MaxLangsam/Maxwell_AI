import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export const createServerClient = () => {
  const cookieStore = cookies()
  // Use environment variables only - never hardcode credentials
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
}

export type SupabaseServerClient = ReturnType<typeof createServerClient>
