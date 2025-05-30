import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { JournalService } from "@/lib/services/journal-service"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tagFilter = searchParams.get("tag")
    const moodFilter = searchParams.get("mood")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const journalService = new JournalService()
    const entries = await journalService.getEntries(
      user.id,
      limit,
      offset,
      tagFilter || undefined,
      moodFilter || undefined,
    )

    return NextResponse.json({ entries })
  } catch (error: any) {
    console.error("Error fetching journal entries:", error)

    // Check if it's a table not found error
    if (error?.code === "42P01" || error?.message?.includes("does not exist")) {
      return NextResponse.json(
        {
          error: "Database tables not found. Please run the journal system migration first.",
          needsSetup: true,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, mood, tags } = await request.json()

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const journalService = new JournalService()
    const entry = await journalService.createEntry(user.id, title, content, mood, tags || [])

    if (!entry) {
      return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
