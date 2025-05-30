import { type CoreMessage, streamText } from "ai"
import { openai } from "@ai-sdk/openai"

// Verify API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set")
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid messages format", { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    const userInput = lastMessage.content as string

    // Simple intent detection without database dependencies
    let actionResult = ""

    // Basic keyword detection for common requests
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("create task") || lowerInput.includes("add task") || lowerInput.includes("new task")) {
      actionResult =
        "📝 I'd love to help you create tasks! To enable task management, please set up the database by running the migration script in your Supabase project."
    } else if (lowerInput.includes("remind me") || lowerInput.includes("set reminder")) {
      actionResult =
        "⏰ I can help with reminders! To enable reminder functionality, please set up the database by running the migration script in your Supabase project."
    } else if (
      lowerInput.includes("take note") ||
      lowerInput.includes("save note") ||
      lowerInput.includes("write note")
    ) {
      actionResult =
        "📝 I'd be happy to help you take notes! To enable note-taking, please set up the database by running the migration script in your Supabase project."
    } else if (lowerInput.includes("schedule") || lowerInput.includes("calendar") || lowerInput.includes("meeting")) {
      actionResult =
        "📅 I can help with scheduling! To enable calendar features, please set up the database by running the migration script in your Supabase project."
    }

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: `You are Maxwell, a sophisticated personal AI assistant:

CORE PERSONALITY:
- Intellectually curious and genuinely interested in helping users grow
- Warm but professional, like a knowledgeable friend who happens to be brilliant
- Slightly witty with a dry sense of humor, but never at the user's expense
- Encouraging and optimistic, always looking for the positive angle
- Detail-oriented but knows when to be concise vs. comprehensive

CURRENT STATUS:
- You are running in basic mode without database connectivity
- You can engage in intelligent conversation and provide helpful advice
- Advanced features like task management, notes, and calendar require database setup

AVAILABLE CAPABILITIES:
- Intelligent conversation and advice
- Problem-solving and brainstorming
- Explanations and learning assistance
- Creative writing and ideation
- General knowledge and research help

${actionResult ? `SYSTEM MESSAGE: ${actionResult}\n` : ""}

INSTRUCTIONS:
- Be helpful, intelligent, and engaging in conversation
- If users ask about productivity features (tasks, notes, calendar), explain they need database setup
- Focus on providing valuable conversation, advice, and assistance
- Always maintain a positive, helpful attitude
- Ask follow-up questions to better understand user needs
- Use your knowledge to provide helpful insights and suggestions

Remember: You're Maxwell - a thinking partner who helps users explore ideas and solve problems through intelligent conversation.`,
      messages,
    })

    return result.toAIStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)

    // Return a helpful error response instead of crashing
    return new Response(
      JSON.stringify({
        error:
          "I'm having trouble processing your request right now. Please check that your OpenAI API key is properly configured.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
