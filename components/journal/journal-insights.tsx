"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Brain, Lightbulb, BarChart3, RefreshCw, Smile } from "lucide-react"
import { cn } from "@/lib/utils"

interface JournalInsight {
  id: string
  type: "mood_trend" | "topic_analysis" | "growth_pattern" | "reflection_prompt"
  title: string
  description: string
  data: any
  period_start: string
  period_end: string
  created_at: string
}

interface JournalInsightsProps {
  userId: string
}

export function JournalInsights({ userId }: JournalInsightsProps) {
  const [insights, setInsights] = useState<JournalInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInsights()
  }, [userId])

  const loadInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/journal/insights")
      if (!response.ok) {
        throw new Error("Failed to load insights")
      }

      const data = await response.json()
      setInsights(data.insights || [])
    } catch (error) {
      console.error("Error loading insights:", error)
      setError("Failed to load insights. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "mood_trend":
        return Smile
      case "topic_analysis":
        return Brain
      case "growth_pattern":
        return TrendingUp
      case "reflection_prompt":
        return Lightbulb
      default:
        return BarChart3
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "mood_trend":
        return "text-yellow-600 bg-yellow-100"
      case "topic_analysis":
        return "text-purple-600 bg-purple-100"
      case "growth_pattern":
        return "text-green-600 bg-green-100"
      case "reflection_prompt":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const renderMoodChart = (data: Record<string, number>) => {
    const total = Object.values(data).reduce((sum, count) => sum + count, 0)
    const moodEmojis = {
      happy: "😊",
      sad: "😢",
      neutral: "😐",
      excited: "🤩",
      anxious: "😰",
      calm: "😌",
      frustrated: "😤",
      grateful: "🙏",
    }

    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {Object.entries(data).map(([mood, count]) => (
          <div key={mood} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="flex items-center gap-2 text-sm">
              <span>{moodEmojis[mood as keyof typeof moodEmojis] || "😊"}</span>
              {mood}
            </span>
            <Badge variant="secondary">{count}</Badge>
          </div>
        ))}
      </div>
    )
  }

  const renderTopicChart = (data: Record<string, number>) => {
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {Object.entries(data).map(([topic, count]) => (
          <Badge key={topic} variant="outline" className="text-sm">
            {topic} ({count})
          </Badge>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Generating insights...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadInsights} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Journal Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
            <p className="text-gray-500 mb-4">
              Write a few journal entries to start seeing personalized insights about your thoughts and patterns.
            </p>
            <Button onClick={loadInsights} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Journal Insights
        </h2>
        <Button onClick={loadInsights} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {insights.map((insight) => {
          const Icon = getInsightIcon(insight.type)
          const colorClass = getInsightColor(insight.type)

          return (
            <Card key={insight.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={cn("p-2 rounded-full", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {insight.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{insight.description}</p>

                {insight.type === "mood_trend" && insight.data && (
                  <div>
                    <h4 className="font-medium mb-2">Mood Distribution</h4>
                    {renderMoodChart(insight.data)}
                  </div>
                )}

                {insight.type === "topic_analysis" && insight.data && (
                  <div>
                    <h4 className="font-medium mb-2">Top Topics</h4>
                    {renderTopicChart(insight.data)}
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Period: {new Date(insight.period_start).toLocaleDateString()} -{" "}
                  {new Date(insight.period_end).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
