import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { TagService } from "./tag-service"
import { FileService } from "./file-service"

export interface EnhancedInsight {
  id: string
  user_id: string
  type: "pattern" | "suggestion" | "question" | "connection" | "file_insight" | "tag_insight"
  title: string
  description: string
  confidence: number
  evidence: string[]
  actionable: boolean
  tags: string[]
  related_items: string[]
  created_at: string
}

export class EnhancedInsightService {
  private supabase = createServerClient()
  private tagService = new TagService()
  private fileService = new FileService()

  async generateInsights(userId: string): Promise<EnhancedInsight[]> {
    try {
      const insights: EnhancedInsight[] = []

      // Get user data
      const [messages, files, tags] = await Promise.all([
        this.getRecentMessages(userId),
        this.fileService.getFiles(userId),
        this.tagService.getTags(userId),
      ])

      // Generate different types of insights
      const [patternInsights, fileInsights, tagInsights, connectionInsights] = await Promise.all([
        this.generatePatternInsights(userId, messages),
        this.generateFileInsights(userId, files),
        this.generateTagInsights(userId, tags),
        this.generateConnectionInsights(userId, messages, files),
      ])

      insights.push(...patternInsights, ...fileInsights, ...tagInsights, ...connectionInsights)

      // Save insights to database
      if (insights.length > 0) {
        await this.saveInsights(insights)
      }

      return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 10)
    } catch (error) {
      console.error("Error generating enhanced insights:", error)
      return []
    }
  }

  private async generatePatternInsights(userId: string, messages: any[]): Promise<EnhancedInsight[]> {
    if (messages.length < 5) return []

    try {
      const recentContent = messages
        .slice(0, 20)
        .map((m) => m.content)
        .join("\n")

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Analyze these user messages and identify 2-3 patterns or insights. Return JSON array with this structure:
        [{"title": "Pattern Title", "description": "Description", "confidence": 0.8, "evidence": ["evidence1", "evidence2"], "actionable": true, "tags": ["tag1", "tag2"]}]
        
        Messages: ${recentContent}`,
      })

      const patterns = JSON.parse(text)
      return patterns.map((pattern: any) => ({
        id: `pattern_${Date.now()}_${Math.random()}`,
        user_id: userId,
        type: "pattern" as const,
        ...pattern,
        related_items: [],
        created_at: new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Error generating pattern insights:", error)
      return []
    }
  }

  private async generateFileInsights(userId: string, files: any[]): Promise<EnhancedInsight[]> {
    if (files.length === 0) return []

    try {
      const insights: EnhancedInsight[] = []

      for (const file of files.slice(0, 5)) {
        if (file.summary && file.tags) {
          insights.push({
            id: `file_${file.id}_${Date.now()}`,
            user_id: userId,
            type: "file_insight",
            title: `Insights from ${file.original_name}`,
            description: `Key insights extracted from your uploaded file: ${file.summary}`,
            confidence: 0.7,
            evidence: [file.summary],
            actionable: true,
            tags: file.tags,
            related_items: [file.id],
            created_at: new Date().toISOString(),
          })
        }
      }

      return insights
    } catch (error) {
      console.error("Error generating file insights:", error)
      return []
    }
  }

  private async generateTagInsights(userId: string, tags: any[]): Promise<EnhancedInsight[]> {
    if (tags.length === 0) return []

    try {
      const insights: EnhancedInsight[] = []
      const topTags = tags.slice(0, 3)

      for (const tag of topTags) {
        if (tag.usage_count > 3) {
          insights.push({
            id: `tag_${tag.id}_${Date.now()}`,
            user_id: userId,
            type: "tag_insight",
            title: `Frequent Focus: ${tag.name}`,
            description: `You've been focusing heavily on "${tag.name}" topics (${tag.usage_count} items). This suggests it's an important area for you.`,
            confidence: Math.min(0.9, tag.usage_count * 0.1),
            evidence: [`${tag.usage_count} items tagged with "${tag.name}"`],
            actionable: true,
            tags: [tag.name],
            related_items: [],
            created_at: new Date().toISOString(),
          })
        }
      }

      return insights
    } catch (error) {
      console.error("Error generating tag insights:", error)
      return []
    }
  }

  private async generateConnectionInsights(userId: string, messages: any[], files: any[]): Promise<EnhancedInsight[]> {
    if (messages.length === 0 || files.length === 0) return []

    try {
      const insights: EnhancedInsight[] = []
      const recentMessages = messages
        .slice(0, 10)
        .map((m) => m.content)
        .join(" ")

      for (const file of files.slice(0, 3)) {
        if (file.summary) {
          // Simple keyword matching for connections
          const messageWords = recentMessages.toLowerCase().split(/\s+/)
          const fileWords = file.summary.toLowerCase().split(/\s+/)
          const commonWords = messageWords.filter((word) => fileWords.includes(word) && word.length > 4)

          if (commonWords.length > 2) {
            insights.push({
              id: `connection_${file.id}_${Date.now()}`,
              user_id: userId,
              type: "connection",
              title: `Connection Found`,
              description: `Your recent conversations relate to your uploaded file "${file.original_name}". Consider referencing it for more context.`,
              confidence: Math.min(0.8, commonWords.length * 0.1),
              evidence: [`Common themes: ${commonWords.slice(0, 3).join(", ")}`],
              actionable: true,
              tags: file.tags || [],
              related_items: [file.id],
              created_at: new Date().toISOString(),
            })
          }
        }
      }

      return insights
    } catch (error) {
      console.error("Error generating connection insights:", error)
      return []
    }
  }

  private async getRecentMessages(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from("messages")
        .select("content, created_at")
        .eq("role", "user")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        console.error("Error fetching messages:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching messages:", error)
      return []
    }
  }

  private async saveInsights(insights: EnhancedInsight[]): Promise<void> {
    try {
      const { error } = await this.supabase.from("insights").insert(
        insights.map((insight) => ({
          user_id: insight.user_id,
          type: insight.type,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence,
          evidence: insight.evidence,
          actionable: insight.actionable,
          metadata: {
            tags: insight.tags,
            related_items: insight.related_items,
          },
        })),
      )

      if (error) {
        console.error("Error saving insights:", error)
      }
    } catch (error) {
      console.error("Error saving insights:", error)
    }
  }
}
