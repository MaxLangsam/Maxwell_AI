import { EmbeddingService } from "./embedding-service"
import { InsightService } from "./insight-service"
import { MemoryService } from "./memory-service"

export class SecondBrainService {
  private embeddingService = new EmbeddingService()
  private insightService = new InsightService()
  private memoryService = new MemoryService()

  async processUserInput(
    userId: string,
    content: string,
    sourceType: "chat" | "note" | "task" | "journal" | "idea",
    sourceId: string,
  ): Promise<void> {
    try {
      // Generate embedding for the content
      const embedding = await this.embeddingService.generateEmbedding(content)

      if (!embedding || embedding.length === 0) {
        console.warn("Failed to generate embedding for content")
        return
      }

      // Extract themes and analyze sentiment
      const themes = await this.embeddingService.extractThemes(content)
      const sentiment = await this.embeddingService.analyzeSentiment(content)

      // Store the embedding with metadata (only if database is available)
      await this.embeddingService.storeEmbedding({
        user_id: userId,
        content,
        source_type: sourceType,
        source_id: sourceId,
        embedding,
        themes,
        sentiment,
        metadata: {
          word_count: content.split(/\s+/).length,
          has_questions: content.includes("?"),
          has_emotions: this.detectEmotions(content),
        },
      })

      // Store important information in long-term memory (only if database is available)
      if (this.isImportantContent(content, themes)) {
        await this.memoryService.addMemory(
          {
            type: "long_term",
            content: content.slice(0, 500),
            context: { themes, sentiment, source_type: sourceType },
            importance: this.calculateImportance(content, themes),
          },
          userId,
        )
      }
    } catch (error) {
      console.error("Error processing user input for second brain:", error)
      // Don't throw error - continue with basic functionality
    }
  }

  async findRelatedThoughts(userId: string, query: string, limit = 5): Promise<any[]> {
    try {
      const queryEmbedding = await this.embeddingService.generateEmbedding(query)
      if (!queryEmbedding || queryEmbedding.length === 0) return []

      return await this.embeddingService.findSimilarThoughts(userId, queryEmbedding, limit, 0.6)
    } catch (error) {
      console.error("Error finding related thoughts:", error)
      return []
    }
  }

  async generateContextualPrompts(userId: string, currentInput: string): Promise<string[]> {
    const prompts: string[] = []

    try {
      // Find related thoughts
      const relatedThoughts = await this.findRelatedThoughts(userId, currentInput, 3)

      if (relatedThoughts.length > 0) {
        prompts.push(`This reminds me of when you mentioned: "${relatedThoughts[0].content.slice(0, 100)}..."`)
      }

      // Get recent themes
      const themes = await this.embeddingService.detectThemes(userId)
      if (themes.length > 0) {
        const topTheme = themes[0]
        prompts.push(`You've been thinking about ${topTheme} a lot lately. How does this connect?`)
      }

      // Generate insights-based prompts
      const insights = await this.insightService.generateInsights(userId)
      const questionInsights = insights.filter((i) => i.type === "question")

      if (questionInsights.length > 0) {
        prompts.push(questionInsights[0].description)
      }

      return prompts.slice(0, 3)
    } catch (error) {
      console.error("Error generating contextual prompts:", error)
      return []
    }
  }

  private detectEmotions(content: string): string[] {
    const emotions: string[] = []
    const emotionKeywords = {
      joy: ["happy", "excited", "thrilled", "delighted", "joyful"],
      sadness: ["sad", "depressed", "down", "melancholy", "blue"],
      anger: ["angry", "frustrated", "mad", "irritated", "furious"],
      fear: ["scared", "afraid", "anxious", "worried", "nervous"],
      surprise: ["surprised", "amazed", "shocked", "astonished"],
      disgust: ["disgusted", "revolted", "repulsed"],
    }

    const lowerContent = content.toLowerCase()

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some((keyword) => lowerContent.includes(keyword))) {
        emotions.push(emotion)
      }
    })

    return emotions
  }

  private isImportantContent(content: string, themes: string[]): boolean {
    // Content is important if it:
    // 1. Contains goals or aspirations
    // 2. Has strong emotional content
    // 3. Contains insights or realizations
    // 4. Is longer than average (detailed thoughts)
    // 5. Contains multiple themes

    const importanceIndicators = [
      content.includes("goal") || content.includes("want to") || content.includes("aspire"),
      content.includes("realize") || content.includes("understand") || content.includes("insight"),
      content.split(/\s+/).length > 50, // Longer content
      themes.length > 2, // Multiple themes
      content.includes("!") || content.includes("?"), // Emotional punctuation
    ]

    return importanceIndicators.filter(Boolean).length >= 2
  }

  private calculateImportance(content: string, themes: string[]): number {
    let importance = 5 // Base importance

    // Increase importance based on content characteristics
    if (content.includes("goal") || content.includes("important")) importance += 2
    if (content.includes("insight") || content.includes("realize")) importance += 2
    if (themes.length > 2) importance += 1
    if (content.split(/\s+/).length > 100) importance += 1
    if (content.includes("!")) importance += 1

    return Math.min(10, importance) // Cap at 10
  }
}
