import { createServerClient } from "@/lib/supabase/server"
import { generateText, embed } from "ai"
import { openai } from "@ai-sdk/openai"

export interface EmbeddingEntry {
  id: string
  user_id: string
  content: string
  source_type: "chat" | "note" | "task" | "journal" | "idea"
  source_id: string
  embedding: number[]
  themes: string[]
  sentiment: "positive" | "negative" | "neutral"
  created_at: string
  metadata: Record<string, any>
}

export class EmbeddingService {
  private supabase = createServerClient()

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: text,
      })
      return embedding
    } catch (error) {
      console.error("Error generating embedding:", error)
      return []
    }
  }

  async storeEmbedding(entry: Omit<EmbeddingEntry, "id" | "created_at">): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("embeddings")
        .insert({
          ...entry,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (error) {
        if (error.message.includes("does not exist")) {
          console.warn("Embeddings table does not exist yet. Please run the database migrations.")
          return null
        }
        console.error("Error storing embedding:", error)
        return null
      }

      return data.id
    } catch (error) {
      console.error("Error storing embedding:", error)
      return null
    }
  }

  async findSimilarThoughts(
    userId: string,
    queryEmbedding: number[],
    limit = 10,
    threshold = 0.7,
  ): Promise<EmbeddingEntry[]> {
    try {
      // Using cosine similarity - in production, you'd use pgvector or similar
      const { data, error } = await this.supabase
        .from("embeddings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100) // Get recent entries for similarity calculation

      if (error) {
        if (error.message.includes("does not exist")) {
          console.warn("Embeddings table does not exist yet. Please run the database migrations.")
          return []
        }
        console.error("Error finding similar thoughts:", error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      // Calculate cosine similarity in JavaScript (for demo - use database in production)
      const similarities = data
        .map((entry) => ({
          ...entry,
          similarity: this.cosineSimilarity(queryEmbedding, entry.embedding),
        }))
        .filter((entry) => entry.similarity > threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)

      return similarities
    } catch (error) {
      console.error("Error finding similar thoughts:", error)
      return []
    }
  }

  async detectThemes(userId: string, timeframe = "week"): Promise<string[]> {
    try {
      const supabase = createServerClient()

      // Get recent content from messages
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("role", "user")
        .gte("created_at", this.getTimeframeDate(timeframe))
        .order("created_at", { ascending: false })

      if (messagesError) {
        if (messagesError.message.includes("does not exist")) {
          console.warn("Messages table does not exist yet. Please run the database migrations.")
          return []
        }
        throw messagesError
      }

      if (!messages || messages.length === 0) {
        return []
      }

      // Combine content
      const combinedContent = messages.map((m) => m.content).join("\n\n")

      // Use AI to detect themes
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Analyze the following user messages and identify the top 5 themes or topics. Return only a JSON array of theme names:\n\n${combinedContent}`,
      })

      try {
        return JSON.parse(text)
      } catch (e) {
        console.error("Error parsing themes:", e)
        return []
      }
    } catch (error) {
      console.error("Error detecting themes:", error)
      return []
    }
  }

  async extractThemes(text: string): Promise<string[]> {
    // Simple keyword extraction - in production, use NLP libraries or AI
    const themes: string[] = []

    const keywords = {
      productivity: ["productive", "efficiency", "workflow", "organize", "system", "routine"],
      motivation: ["motivated", "inspiration", "drive", "energy", "passion", "purpose"],
      stress: ["stress", "overwhelmed", "pressure", "anxiety", "worried", "burnout"],
      goals: ["goal", "objective", "target", "achievement", "success", "progress"],
      creativity: ["creative", "idea", "innovation", "brainstorm", "design", "artistic"],
      relationships: ["friend", "family", "colleague", "team", "social", "connection"],
      learning: ["learn", "study", "knowledge", "skill", "education", "growth"],
      health: ["health", "exercise", "sleep", "nutrition", "wellness", "fitness"],
      career: ["job", "career", "work", "professional", "promotion", "salary"],
      finance: ["money", "budget", "investment", "savings", "financial", "income"],
    }

    const lowerText = text.toLowerCase()

    Object.entries(keywords).forEach(([theme, words]) => {
      if (words.some((word) => lowerText.includes(word))) {
        themes.push(theme)
      }
    })

    return themes
  }

  async analyzeSentiment(text: string): Promise<"positive" | "negative" | "neutral"> {
    // Simple sentiment analysis - in production, use proper sentiment analysis
    const positiveWords = ["good", "great", "excellent", "happy", "excited", "love", "amazing", "wonderful"]
    const negativeWords = ["bad", "terrible", "sad", "frustrated", "angry", "hate", "awful", "disappointed"]

    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length

    if (positiveCount > negativeCount) return "positive"
    if (negativeCount > positiveCount) return "negative"
    return "neutral"
  }

  private getTimeframeDate(timeframe: string): string {
    const now = new Date()
    switch (timeframe) {
      case "day":
        now.setDate(now.getDate() - 1)
        break
      case "week":
        now.setDate(now.getDate() - 7)
        break
      case "month":
        now.setMonth(now.getMonth() - 1)
        break
      default:
        now.setDate(now.getDate() - 7)
    }
    return now.toISOString()
  }

  private cosineSimilarity(a: number[], b: number[]): number {
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
}
