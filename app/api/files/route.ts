import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { FileService } from "@/lib/services/file-service"

export async function GET() {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fileService = new FileService()
    const files = await fileService.getFiles(user.id)

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
