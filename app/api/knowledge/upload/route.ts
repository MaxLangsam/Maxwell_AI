import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type and size
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/markdown",
      "text/csv",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not supported" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const storagePath = `knowledge/${user.id}/${filename}`

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("knowledge-files")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Extract text content based on file type
    let contentText = ""

    if (file.type === "text/plain" || file.type === "text/markdown" || file.type === "text/csv") {
      contentText = await file.text()
    } else {
      // For other file types, we'll process them asynchronously
      contentText = "Processing..."
    }

    // Create database record
    const { data: fileRecord, error: dbError } = await supabase
      .from("knowledge_files")
      .insert({
        user_id: user.id,
        filename,
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        content_text: contentText,
        status:
          file.type === "text/plain" || file.type === "text/markdown" || file.type === "text/csv"
            ? "ready"
            : "processing",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      // Clean up uploaded file
      await supabase.storage.from("knowledge-files").remove([storagePath])
      return NextResponse.json({ error: "Failed to save file record" }, { status: 500 })
    }

    // Process text files immediately
    if (file.type === "text/plain" || file.type === "text/markdown" || file.type === "text/csv") {
      await processFileContent(fileRecord.id, contentText, user.id)
    }

    return NextResponse.json({
      success: true,
      fileId: fileRecord.id,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function processFileContent(fileId: string, content: string, userId: string) {
  try {
    const supabase = createServerClient()

    // Generate summary using AI
    const { text: summary } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Summarize the following document content in 2-3 sentences:\n\n${content.slice(0, 4000)}`,
    })

    // Extract tags using AI
    const { text: tagsText } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Extract 3-5 relevant tags/keywords from this document content. Return only the tags separated by commas:\n\n${content.slice(0, 2000)}`,
    })

    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    // Update file record with summary and tags
    await supabase
      .from("knowledge_files")
      .update({
        summary,
        tags,
        status: "ready",
      })
      .eq("id", fileId)

    // Create chunks for vector search
    const chunks = chunkText(content, 1000) // 1000 character chunks

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      // Generate embedding for chunk
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      })

      const embedding = embeddingResponse.data[0].embedding

      // Store chunk with embedding
      await supabase.from("knowledge_chunks").insert({
        file_id: fileId,
        user_id: userId,
        chunk_text: chunk,
        chunk_index: i,
        embedding,
        metadata: { length: chunk.length },
      })
    }
  } catch (error) {
    console.error("Error processing file content:", error)

    // Update file status to error
    const supabase = createServerClient()
    await supabase.from("knowledge_files").update({ status: "error" }).eq("id", fileId)
  }
}

function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = []
  const sentences = text.split(/[.!?]+/)

  let currentChunk = ""

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.filter((chunk) => chunk.length > 0)
}
