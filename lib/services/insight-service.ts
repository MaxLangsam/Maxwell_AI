import { createServerClient } from "@/lib/supabase/server"
import { EmbeddingService } from "./embedding-service"
import { NoteService } from "./note-service"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface Insight {
  id: string
  type: "pattern" | "suggestion" | "question" | "connection" | "forgotten_idea"
  title: string
  description: string
  confidence: number
  evidence: string[]
  actionable: boolean
  created_at: string
}

export interface ThoughtDigest {
  summary: string
  themes: string[]
  highlights: string[]
  suggestions: string[]
}

export class InsightService {
  private embeddingService: EmbeddingService
  private noteService: NoteService

  constructor() {
    this.embeddingService = new EmbeddingService()
    this.noteService = new NoteService()
  }

  async generateInsights(userId: string): Promise<Insight[]> {
    try {
      // Check if insights table exists
      const supabase = createServerClient()
      const { error: tableCheckError } = await supabase.from("insights").select("id").limit(1)

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        console.warn("Insights table does not exist yet. Please run the database migrations.")
        return []
      }

      // Get existing insights
      const { data: existingInsights, error: insightsError } = await supabase
        .from("insights")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (insightsError && !insightsError.message.includes("does not exist")) {
        throw insightsError
      }

      // If we have recent insights, return them
      if (existingInsights && existingInsights.length > 0) {
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)

        const recentInsight = existingInsights.find((insight) => new Date(insight.created_at) > oneDayAgo)

        if (recentInsight) {
          return existingInsights.map((insight) => ({
            id: insight.id,
            type: insight.type,
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence,
            evidence: Array.isArray(insight.evidence) ? insight.evidence : [],
            actionable: insight.actionable,
            created_at: insight.created_at,
          }))
        }
      }

      // Generate new insights
      const behaviorInsights = await this.analyzeBehavior(userId)
      const themeInsights = await this.analyzeThemes(userId)

      const allInsights = [...behaviorInsights, ...themeInsights]

      // Store new insights
      if (allInsights.length > 0) {
        const { error: insertError } = await supabase.from("insights").insert(
          allInsights.map((insight) => ({
            user_id: userId,
            ...insight,
          })),
        )

        if (insertError && !insertError.message.includes("does not exist")) {
          throw insertError
        }
      }

      return allInsights
    } catch (error) {
      console.error("Error generating insights:", error)
      return []
    }
  }

  async generateWeeklyDigest(userId: string): Promise<ThoughtDigest> {
    try {
      // Get notes
      const notes = await this.noteService.getNotes(userId)

      // If we don't have enough data, return a simple digest
      if (notes.length === 0) {
        return {
          summary:
            "Not enough data to generate a weekly digest yet. Continue using Maxwell to get personalized insights.",
          themes: [],
          highlights: [],
          suggestions: [
            "Start taking notes to build your thought patterns",
            "Try asking Maxwell questions about your goals",
            "Use the chat to explore ideas and get insights",
          ],
        }
      }

      // Generate digest using AI
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Generate a weekly digest for a user based on their activity. Include a summary, key themes, highlights, and suggestions.
        
        Recent Notes: ${JSON.stringify(notes.slice(0, 5))}
        
        Return a JSON object with the following structure:
        {
          "summary": "A paragraph summarizing the week",
          "themes": ["Theme 1", "Theme 2", "Theme 3"],
          "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
          "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
        }`,
      })

      try {
        return JSON.parse(text)
      } catch (e) {
        console.error("Error parsing digest:", e)
        return {
          summary: "Error generating weekly digest. Please try again later.",
          themes: [],
          highlights: [],
          suggestions: [],
        }
      }
    } catch (error) {
      console.error("Error generating weekly digest:", error)
      return {
        summary: "Error generating weekly digest. Please try again later.",
        themes: [],
        highlights: [],
        suggestions: [],
      }
    }
  }

  private async analyzeBehavior(userId: string): Promise<Insight[]> {
    try {
      // Get user's notes
      const notes = await this.noteService.getNotes(userId)

      if (notes.length === 0) {
        return []
      }

      // Use AI to analyze behavior
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Analyze the following user notes and identify 2-3 behavioral insights. Each insight should include a title, description, confidence level, and whether it's actionable.
        
        Notes: ${JSON.stringify(notes.slice(0, 10))}
        
        Return a JSON array with objects having this structure:
        {
          "id": "unique_id",
          "type": "suggestion",
          "title": "Insight title",
          "description": "Detailed description",
          "confidence": 0.8,
          "evidence": ["Evidence 1", "Evidence 2"],
          "actionable": true,
          "created_at": "${new Date().toISOString()}"
        }`,
      })

      try {
        return JSON.parse(text)
      } catch (e) {
        console.error("Error parsing behavior insights:", e)
        return []
      }
    } catch (error) {
      console.error("Error analyzing behavior:", error)
      return []
    }
  }

  private async analyzeThemes(userId: string): Promise<Insight[]> {
    try {
      // Get themes from embedding service
      const themes = await this.embeddingService.detectThemes(userId, "month")

      if (themes.length === 0) {
        return []
      }

      // Use AI to analyze themes
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Based on these themes from user activity, generate 2-3 theme-based insights. Each insight should include a title, description, and whether it's actionable.
        
        Themes: ${JSON.stringify(themes)}
        
        Return a JSON array with objects having this structure:
        {
          "id": "unique_id",
          "type": "pattern",
          "title": "Insight title",
          "description": "Detailed description",
          "confidence": 0.7,
          "evidence": ["Theme 1", "Theme 2"],
          "actionable": true,
          "created_at": "${new Date().toISOString()}"
        }`,
      })

      try {
        return JSON.parse(text)
      } catch (e) {
        console.error("Error parsing theme insights:", e)
        return []
      }
    } catch (error) {
      console.error("Error analyzing themes:", error)
      return []
    }
  }
}
