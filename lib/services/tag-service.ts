import { createServerClient } from "@/lib/supabase/server"

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  usage_count: number
  created_at: string
  updated_at: string
}

export interface TaggedItem {
  id: string
  user_id: string
  item_type: "session" | "file" | "note" | "task"
  item_id: string
  tag_name: string
  created_at: string
}

export class TagService {
  private supabase = createServerClient()

  async createTag(userId: string, name: string, color?: string): Promise<Tag | null> {
    try {
      const { data, error } = await this.supabase
        .from("tags")
        .insert({
          user_id: userId,
          name: name.trim(),
          color: color || this.generateTagColor(name),
          usage_count: 0,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating tag:", error)
        return null
      }

      return data as Tag
    } catch (error) {
      console.error("Error creating tag:", error)
      return null
    }
  }

  async getTags(userId: string): Promise<Tag[]> {
    try {
      const { data, error } = await this.supabase
        .from("tags")
        .select("*")
        .eq("user_id", userId)
        .order("usage_count", { ascending: false })

      if (error) {
        console.error("Error fetching tags:", error)
        return []
      }

      return data as Tag[]
    } catch (error) {
      console.error("Error fetching tags:", error)
      return []
    }
  }

  async tagItem(userId: string, itemType: string, itemId: string, tagNames: string[]): Promise<boolean> {
    try {
      // Remove existing tags for this item
      await this.supabase.from("tagged_items").delete().eq("user_id", userId).eq("item_id", itemId)

      if (tagNames.length === 0) {
        return true
      }

      // Ensure all tags exist
      for (const tagName of tagNames) {
        await this.ensureTagExists(userId, tagName)
      }

      // Create new tag associations
      const taggedItems = tagNames.map((tagName) => ({
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
        tag_name: tagName,
      }))

      const { error } = await this.supabase.from("tagged_items").insert(taggedItems)

      if (error) {
        console.error("Error tagging item:", error)
        return false
      }

      // Update usage counts
      await this.updateTagUsageCounts(userId, tagNames)

      return true
    } catch (error) {
      console.error("Error tagging item:", error)
      return false
    }
  }

  async getItemTags(userId: string, itemId: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from("tagged_items")
        .select("tag_name")
        .eq("user_id", userId)
        .eq("item_id", itemId)

      if (error) {
        console.error("Error fetching item tags:", error)
        return []
      }

      return data.map((item) => item.tag_name)
    } catch (error) {
      console.error("Error fetching item tags:", error)
      return []
    }
  }

  async getItemsByTag(userId: string, tagName: string, itemType?: string): Promise<TaggedItem[]> {
    try {
      let query = this.supabase.from("tagged_items").select("*").eq("user_id", userId).eq("tag_name", tagName)

      if (itemType) {
        query = query.eq("item_type", itemType)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching items by tag:", error)
        return []
      }

      return data as TaggedItem[]
    } catch (error) {
      console.error("Error fetching items by tag:", error)
      return []
    }
  }

  private async ensureTagExists(userId: string, tagName: string): Promise<void> {
    const { data: existingTag } = await this.supabase
      .from("tags")
      .select("id")
      .eq("user_id", userId)
      .eq("name", tagName)
      .single()

    if (!existingTag) {
      await this.createTag(userId, tagName)
    }
  }

  private async updateTagUsageCounts(userId: string, tagNames: string[]): Promise<void> {
    for (const tagName of tagNames) {
      const { data: count } = await this.supabase
        .from("tagged_items")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("tag_name", tagName)

      await this.supabase
        .from("tags")
        .update({ usage_count: count?.length || 0 })
        .eq("user_id", userId)
        .eq("name", tagName)
    }
  }

  private generateTagColor(name: string): string {
    const colors = [
      "#3B82F6", // Blue
      "#10B981", // Green
      "#8B5CF6", // Purple
      "#F59E0B", // Orange
      "#EF4444", // Red
      "#06B6D4", // Cyan
      "#84CC16", // Lime
      "#F97316", // Orange
      "#EC4899", // Pink
      "#6366F1", // Indigo
    ]

    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
  }
}
