import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { JournalService } from "@/lib/services/journal-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const journalService = new JournalService()
    const entry = await journalService.getEntry(user.id, params.id)

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const entry = await journalService.updateEntry(user.id, params.id, {
      title,
      content,
      mood,
      tags: tags || [],
    })

    if (!entry) {
      return NextResponse.json({ error: "Failed to update entry" }, { status: 500 })
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const journalService = new JournalService()
    const success = await journalService.deleteEntry(user.id, params.id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
