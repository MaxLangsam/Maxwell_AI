import { type CoreMessage, streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json()

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a helpful personal AI assistant. Be friendly, concise, and helpful in your responses.",
    messages,
  })

  return result.toDataStreamResponse()
}
