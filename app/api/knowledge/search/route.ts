import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { query, limit = 5 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Search for similar chunks using cosine similarity
    // Note: In production, you'd use pgvector for this
    const { data: chunks, error } = await supabase
      .from("knowledge_chunks")
      .select(`
        *,
        knowledge_files!inner(original_name, summary, tags)
      `)
      .eq("user_id", user.id)
      .limit(50) // Get more chunks to calculate similarity

    if (error) {
      console.error("Error searching knowledge:", error)
      return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }

    // Calculate cosine similarity (simplified version)
    const results = chunks
      .map((chunk: any) => ({
        ...chunk,
        similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .filter((chunk: any) => chunk.similarity > 0.7) // Similarity threshold
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, limit)

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Knowledge search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
