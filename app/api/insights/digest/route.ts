import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { InsightService } from "@/lib/services/insight-service"

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const insightService = new InsightService()
  const digest = await insightService.generateWeeklyDigest(user.id)

  return NextResponse.json({ digest })
}
