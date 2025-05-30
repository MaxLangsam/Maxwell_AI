import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fileId = params.id

    // Get file info first
    const { data: file, error: fetchError } = await supabase
      .from("knowledge_files")
      .select("storage_path")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Delete from storage
    await supabase.storage.from("knowledge-files").remove([file.storage_path])

    // Delete chunks
    await supabase.from("knowledge_chunks").delete().eq("file_id", fileId)

    // Delete file record
    const { error: deleteError } = await supabase
      .from("knowledge_files")
      .delete()
      .eq("id", fileId)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Error deleting file:", deleteError)
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
