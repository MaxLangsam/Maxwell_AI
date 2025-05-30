import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { TagService } from "@/lib/services/tag-service"

export async function GET() {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tagService = new TagService()
    const tags = await tagService.getTags(user.id)

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Error fetching tags:", error)
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

    const { itemType, itemId, tags } = await request.json()

    const tagService = new TagService()
    const success = await tagService.tagItem(user.id, itemType, itemId, tags)

    if (!success) {
      return NextResponse.json({ error: "Failed to tag item" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tagging item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
