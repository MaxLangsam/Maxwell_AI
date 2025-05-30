import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { EnhancedInsightService } from "@/lib/services/enhanced-insight-service"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if insights table exists
    const { error: tableCheckError } = await supabase.from("insights").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      console.warn("Insights table does not exist yet. Returning sample insights.")
      return NextResponse.json({
        insights: [
          {
            id: "sample_1",
            type: "suggestion",
            title: "Welcome to Maxwell!",
            description: "Upload files and start tagging your conversations to get personalized insights.",
            confidence: 0.9,
            evidence: ["First time user"],
            actionable: true,
            created_at: new Date().toISOString(),
          },
        ],
        message: "Database tables not set up yet. Please run the database migrations.",
      })
    }

    const insightService = new EnhancedInsightService()
    const insights = await insightService.generateInsights(user.id)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("Unexpected error in insights API:", error)
    return NextResponse.json(
      {
        insights: [],
        error: "An unexpected error occurred while loading insights.",
      },
      { status: 500 },
    )
  }
}
