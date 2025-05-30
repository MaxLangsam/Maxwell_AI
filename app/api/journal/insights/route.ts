import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { JournalService } from "@/lib/services/journal-service"

export async function GET() {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const journalService = new JournalService()
    const insights = await journalService.generateInsights(user.id)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("Error generating journal insights:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
