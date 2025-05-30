"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, TrendingDown, Minus, Lightbulb, HelpCircle, Archive } from "lucide-react"

interface ThoughtDigestProps {
  userId: string
}

interface ThoughtDigest {
  period?: string
  themes?: Array<{ theme: string; count: number; trend: "up" | "down" | "stable" }>
  patterns?: string[]
  insights?: Array<{
    id: string
    type: string
    title: string
    description: string
    confidence: number
    evidence: string[]
    actionable: boolean
    created_at: string
  }>
  questions?: string[]
  forgotten_ideas?: string[]
  mood_trend?: "improving" | "declining" | "stable"
}

export function ThoughtDigestComponent({ userId }: ThoughtDigestProps) {
  const [digest, setDigest] = useState<ThoughtDigest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDigest()
  }, [userId])

  const loadDigest = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // For now, return a default empty digest since the insight service may not be working
      const defaultDigest: ThoughtDigest = {
        period: "Past 7 days",
        themes: [],
        patterns: [],
        insights: [],
        questions: [],
        forgotten_ideas: [],
        mood_trend: "stable",
      }

      setDigest(defaultDigest)
    } catch (error) {
      console.error("Error loading thought digest:", error)
      setError(error instanceof Error ? error.message : "Failed to load digest")

      // Set empty digest even on error
      setDigest({
        period: "Past 7 days",
        themes: [],
        patterns: [],
        insights: [],
        questions: [],
        forgotten_ideas: [],
        mood_trend: "stable",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp size={14} className="text-green-500" />
      case "down":
        return <TrendingDown size={14} className="text-red-500" />
      default:
        return <Minus size={14} className="text-gray-400" />
    }
  }

  const getMoodColor = (mood: "improving" | "declining" | "stable") => {
    switch (mood) {
      case "improving":
        return "text-green-600 bg-green-50"
      case "declining":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  // Safe access to digest properties with fallbacks
  const themes = digest?.themes || []
  const insights = digest?.insights || []
  const questions = digest?.questions || []
  const patterns = digest?.patterns || []
  const forgottenIdeas = digest?.forgotten_ideas || []
  const moodTrend = digest?.mood_trend || "stable"
  const period = digest?.period || "Past 7 days"

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            Thought Digest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Analyzing your thoughts...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            Thought Digest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-red-500 mb-2">Error loading digest</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <Button onClick={loadDigest} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (themes.length === 0 && insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            Thought Digest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 mb-2">Not enough data yet for insights</p>
            <p className="text-sm text-gray-400 mb-4">Keep chatting with Maxwell to get personalized insights!</p>
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">💡 Tip:</p>
              <p>
                Start conversations, ask questions, and share your thoughts to build up data for meaningful insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain size={20} />
              Your Thought Digest
            </CardTitle>
            <Badge variant="outline">{period}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mood Trend:</span>
              <Badge className={getMoodColor(moodTrend)}>{moodTrend}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={loadDigest}>
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Themes */}
      {themes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("themes")}
            >
              <span className="flex items-center gap-2">
                <TrendingUp size={18} />
                Thought Themes
              </span>
              <Badge variant="secondary">{themes.length}</Badge>
            </CardTitle>
          </CardHeader>
          {expandedSections.has("themes") && (
            <CardContent>
              <div className="space-y-3">
                {themes.slice(0, 5).map((theme, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(theme.trend)}
                      <div>
                        <span className="font-medium capitalize">{theme.theme}</span>
                        <p className="text-sm text-gray-500">{theme.count} mentions</p>
                      </div>
                    </div>
                    <Progress
                      value={themes.length > 0 ? (theme.count / Math.max(...themes.map((t) => t.count))) * 100 : 0}
                      className="w-20"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("insights")}
            >
              <span className="flex items-center gap-2">
                <Lightbulb size={18} />
                Key Insights
              </span>
              <Badge variant="secondary">{insights.length}</Badge>
            </CardTitle>
          </CardHeader>
          {expandedSections.has("insights") && (
            <CardContent>
              <div className="space-y-4">
                {insights.slice(0, 3).map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={insight.type === "pattern" ? "default" : "outline"}>{insight.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <Progress value={insight.confidence * 100} className="w-16 h-2" />
                      <span className="text-xs text-gray-500">{Math.round(insight.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Reflective Questions */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("questions")}
            >
              <span className="flex items-center gap-2">
                <HelpCircle size={18} />
                Questions for You
              </span>
              <Badge variant="secondary">{questions.length}</Badge>
            </CardTitle>
          </CardHeader>
          {expandedSections.has("questions") && (
            <CardContent>
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">{question}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Forgotten Ideas */}
      {forgottenIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("forgotten")}
            >
              <span className="flex items-center gap-2">
                <Archive size={18} />
                Forgotten Ideas
              </span>
              <Badge variant="secondary">{forgottenIdeas.length}</Badge>
            </CardTitle>
          </CardHeader>
          {expandedSections.has("forgotten") && (
            <CardContent>
              <div className="space-y-3">
                {forgottenIdeas.map((idea, index) => (
                  <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">{idea}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Patterns */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("patterns")}
            >
              <span className="flex items-center gap-2">
                <Brain size={18} />
                Detected Patterns
              </span>
              <Badge variant="secondary">{patterns.length}</Badge>
            </CardTitle>
          </CardHeader>
          {expandedSections.has("patterns") && (
            <CardContent>
              <div className="space-y-2">
                {patterns.map((pattern, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    {pattern}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
