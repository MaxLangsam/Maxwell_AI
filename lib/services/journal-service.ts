import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood?: "happy" | "sad" | "neutral" | "excited" | "anxious" | "calm" | "frustrated" | "grateful"
  tags: string[]
  attachments: JournalAttachment[]
  created_at: string
  updated_at: string
}

export interface JournalAttachment {
  id: string
  entry_id: string
  filename: string
  original_name: string
  file_type: string
  file_size: number
  storage_path: string
  created_at: string
}

export interface JournalInsight {
  id: string
  user_id: string
  type: "mood_trend" | "topic_analysis" | "growth_pattern" | "reflection_prompt"
  title: string
  description: string
  data: any
  period_start: string
  period_end: string
  created_at: string
}

export class JournalService {
  private supabase = createServerClient()

  async createEntry(
    userId: string,
    title: string,
    content: string,
    mood?: string,
    tags: string[] = [],
  ): Promise<JournalEntry | null> {
    try {
      const { data, error } = await this.supabase
        .from("journal_entries")
        .insert({
          user_id: userId,
          title: title.trim(),
          content: content.trim(),
          mood,
          tags,
        })
        .select()
        .single()

      if (error) {
        if (error.code === "42P01") {
          console.error("Journal tables not created. Please run the database migration first.")
          return null
        }
        console.error("Error creating journal entry:", error)
        return null
      }

      return {
        ...data,
        attachments: [],
      } as JournalEntry
    } catch (error) {
      console.error("Error creating journal entry:", error)
      return null
    }
  }

  async getEntries(
    userId: string,
    limit = 20,
    offset = 0,
    tagFilter?: string,
    moodFilter?: string,
  ): Promise<JournalEntry[]> {
    try {
      // Check if tables exist first
      const { data: tableCheck, error: tableError } = await this.supabase.from("journal_entries").select("id").limit(1)

      if (tableError && tableError.code === "42P01") {
        // Table doesn't exist, return empty array
        console.log("Journal tables not yet created. Please run the database migration.")
        return []
      }

      // Rest of the existing getEntries logic remains the same...
      let query = this.supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (tagFilter) {
        query = query.contains("tags", [tagFilter])
      }

      if (moodFilter) {
        query = query.eq("mood", moodFilter)
      }

      const { data: entries, error: entriesError } = await query

      if (entriesError) {
        console.error("Error fetching journal entries:", entriesError)
        return []
      }

      if (!entries || entries.length === 0) {
        return []
      }

      // Get attachments for all entries
      const entryIds = entries.map((entry) => entry.id)
      const { data: attachments, error: attachmentsError } = await this.supabase
        .from("journal_attachments")
        .select("*")
        .in("entry_id", entryIds)

      if (attachmentsError) {
        console.error("Error fetching attachments:", attachmentsError)
        // Continue without attachments rather than failing
      }

      // Group attachments by entry_id
      const attachmentsByEntry = (attachments || []).reduce(
        (acc, attachment) => {
          if (!acc[attachment.entry_id]) {
            acc[attachment.entry_id] = []
          }
          acc[attachment.entry_id].push(attachment)
          return acc
        },
        {} as Record<string, JournalAttachment[]>,
      )

      // Combine entries with their attachments
      return entries.map((entry) => ({
        ...entry,
        attachments: attachmentsByEntry[entry.id] || [],
      })) as JournalEntry[]
    } catch (error) {
      console.error("Error fetching journal entries:", error)
      return []
    }
  }

  async getEntry(userId: string, entryId: string): Promise<JournalEntry | null> {
    try {
      const { data: entry, error: entryError } = await this.supabase
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .eq("user_id", userId)
        .single()

      if (entryError || !entry) {
        console.error("Error fetching journal entry:", entryError)
        return null
      }

      // Get attachments for this entry
      const { data: attachments, error: attachmentsError } = await this.supabase
        .from("journal_attachments")
        .select("*")
        .eq("entry_id", entryId)

      if (attachmentsError) {
        console.error("Error fetching attachments:", attachmentsError)
      }

      return {
        ...entry,
        attachments: attachments || [],
      } as JournalEntry
    } catch (error) {
      console.error("Error fetching journal entry:", error)
      return null
    }
  }

  async updateEntry(
    userId: string,
    entryId: string,
    updates: Partial<Pick<JournalEntry, "title" | "content" | "mood" | "tags">>,
  ): Promise<JournalEntry | null> {
    try {
      const { data, error } = await this.supabase
        .from("journal_entries")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        console.error("Error updating journal entry:", error)
        return null
      }

      // Get the updated entry with attachments
      return await this.getEntry(userId, entryId)
    } catch (error) {
      console.error("Error updating journal entry:", error)
      return null
    }
  }

  async deleteEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      // Get attachments to delete from storage
      const { data: attachments } = await this.supabase
        .from("journal_attachments")
        .select("storage_path")
        .eq("entry_id", entryId)

      // Delete files from storage
      if (attachments && attachments.length > 0) {
        const storagePaths = attachments.map((att) => att.storage_path)
        const { error: storageError } = await this.supabase.storage.from("journal-files").remove(storagePaths)

        if (storageError) {
          console.error("Error deleting files from storage:", storageError)
        }
      }

      // Delete entry (attachments will be deleted by CASCADE)
      const { error } = await this.supabase.from("journal_entries").delete().eq("id", entryId).eq("user_id", userId)

      return !error
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      return false
    }
  }

  async uploadAttachment(
    userId: string,
    entryId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<JournalAttachment | null> {
    try {
      onProgress?.(10)

      // Verify the entry belongs to the user
      const { data: entry } = await this.supabase
        .from("journal_entries")
        .select("id")
        .eq("id", entryId)
        .eq("user_id", userId)
        .single()

      if (!entry) {
        throw new Error("Entry not found or access denied")
      }

      onProgress?.(20)

      // Generate unique filename
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const filename = `${timestamp}-${sanitizedName}`
      const storagePath = `${userId}/${entryId}/${filename}`

      onProgress?.(30)

      // Upload to Supabase Storage
      const fileBuffer = await file.arrayBuffer()
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from("journal-files")
        .upload(storagePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("Storage upload error:", uploadError)
        throw new Error("Failed to upload file to storage")
      }

      onProgress?.(70)

      // Create database record
      const { data: attachment, error: dbError } = await this.supabase
        .from("journal_attachments")
        .insert({
          entry_id: entryId,
          filename,
          original_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database error:", dbError)
        // Clean up uploaded file
        await this.supabase.storage.from("journal-files").remove([storagePath])
        throw new Error("Failed to save attachment record")
      }

      onProgress?.(100)

      return attachment as JournalAttachment
    } catch (error) {
      console.error("File upload error:", error)
      return null
    }
  }

  async deleteAttachment(userId: string, attachmentId: string): Promise<boolean> {
    try {
      // Get attachment details and verify ownership
      const { data: attachment, error: fetchError } = await this.supabase
        .from("journal_attachments")
        .select(
          `
          *,
          journal_entries!inner(user_id)
        `,
        )
        .eq("id", attachmentId)
        .eq("journal_entries.user_id", userId)
        .single()

      if (fetchError || !attachment) {
        console.error("Error fetching attachment:", fetchError)
        return false
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from("journal-files")
        .remove([attachment.storage_path])

      if (storageError) {
        console.error("Error deleting from storage:", storageError)
      }

      // Delete from database
      const { error: dbError } = await this.supabase.from("journal_attachments").delete().eq("id", attachmentId)

      return !dbError
    } catch (error) {
      console.error("Error deleting attachment:", error)
      return false
    }
  }

  async generateInsights(userId: string): Promise<JournalInsight[]> {
    try {
      const insights: JournalInsight[] = []
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      // Get recent entries
      const entries = await this.getEntries(userId, 50)
      const recentEntries = entries.filter((entry) => entry.created_at >= thirtyDaysAgo)

      if (recentEntries.length === 0) {
        return []
      }

      // Mood trend analysis
      const moodInsight = await this.analyzeMoodTrends(userId, recentEntries)
      if (moodInsight) insights.push(moodInsight)

      // Topic analysis
      const topicInsight = await this.analyzeTopics(userId, recentEntries)
      if (topicInsight) insights.push(topicInsight)

      // Growth patterns
      const growthInsight = await this.analyzeGrowthPatterns(userId, recentEntries)
      if (growthInsight) insights.push(growthInsight)

      return insights
    } catch (error) {
      console.error("Error generating journal insights:", error)
      return []
    }
  }

  private async analyzeMoodTrends(userId: string, entries: JournalEntry[]): Promise<JournalInsight | null> {
    try {
      const moodEntries = entries.filter((entry) => entry.mood)
      if (moodEntries.length < 3) return null

      const moodCounts = moodEntries.reduce(
        (acc, entry) => {
          if (entry.mood) {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1
          }
          return acc
        },
        {} as Record<string, number>,
      )

      const dominantMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]

      return {
        id: `mood_${Date.now()}`,
        user_id: userId,
        type: "mood_trend",
        title: "Mood Patterns",
        description: `Your most frequent mood this month has been "${dominantMood[0]}" (${dominantMood[1]} entries). This suggests ${this.getMoodInsight(dominantMood[0])}.`,
        data: moodCounts,
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error analyzing mood trends:", error)
      return null
    }
  }

  private async analyzeTopics(userId: string, entries: JournalEntry[]): Promise<JournalInsight | null> {
    try {
      const allTags = entries.flatMap((entry) => entry.tags)
      const tagCounts = allTags.reduce(
        (acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const topTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)

      if (topTags.length === 0) return null

      return {
        id: `topics_${Date.now()}`,
        user_id: userId,
        type: "topic_analysis",
        title: "Recurring Themes",
        description: `Your most frequent topics are: ${topTags.map(([tag, count]) => `${tag} (${count})`).join(", ")}. These themes show what's been on your mind lately.`,
        data: Object.fromEntries(topTags),
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error analyzing topics:", error)
      return null
    }
  }

  private async analyzeGrowthPatterns(userId: string, entries: JournalEntry[]): Promise<JournalInsight | null> {
    try {
      const recentContent = entries
        .slice(0, 10)
        .map((entry) => entry.content)
        .join("\n")

      if (recentContent.length < 500) return null

      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `Analyze these journal entries and identify one key growth pattern or insight about the person's development. Be encouraging and specific. Keep it to 2-3 sentences:

${recentContent}`,
      })

      return {
        id: `growth_${Date.now()}`,
        user_id: userId,
        type: "growth_pattern",
        title: "Personal Growth Insight",
        description: text,
        data: {},
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error analyzing growth patterns:", error)
      return null
    }
  }

  private getMoodInsight(mood: string): string {
    const insights = {
      happy: "a positive and optimistic outlook",
      sad: "you may be processing some challenges - remember this is part of growth",
      neutral: "a balanced and steady emotional state",
      excited: "high energy and enthusiasm for life",
      anxious: "you may benefit from mindfulness and stress management techniques",
      calm: "inner peace and emotional stability",
      frustrated: "you're working through obstacles - persistence will pay off",
      grateful: "appreciation and mindfulness in your daily life",
    }
    return insights[mood as keyof typeof insights] || "emotional awareness and self-reflection"
  }
}
