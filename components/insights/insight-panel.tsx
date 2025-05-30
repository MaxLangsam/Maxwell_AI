"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Lightbulb, Link, HelpCircle, Archive, TrendingUp, AlertCircle } from "lucide-react"

interface Insight {
  id: string
  type: "pattern" | "suggestion" | "question" | "connection" | "forgotten_idea"
  title: string
  description: string
  confidence: number
  evidence: string[]
  actionable: boolean
  created_at: string
}

interface InsightPanelProps {
  userId: string
  currentInput?: string
}

export function InsightPanel({ userId, currentInput }: InsightPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadInsights()
  }, [userId])

  const loadInsights = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/insights", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load insights")
      }

      setInsights(data.insights || [])

      if (data.message) {
        setMessage(data.message)
      }
    } catch (error) {
      console.error("Error loading insights:", error)
      setError(error instanceof Error ? error.message : "Failed to load insights. Please try again.")
      setInsights([])
    } finally {
      setIsLoading(false)
    }
  }

  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "pattern":
        return <TrendingUp size={16} />
      case "suggestion":
        return <Lightbulb size={16} />
      case "question":
        return <HelpCircle size={16} />
      case "connection":
        return <Link size={16} />
      case "forgotten_idea":
        return <Archive size={16} />
      default:
        return <Brain size={16} />
    }
  }

  const getInsightColor = (type: Insight["type"]) => {
    switch (type) {
      case "pattern":
        return "border-blue-200 bg-blue-50"
      case "suggestion":
        return "border-green-200 bg-green-50"
      case "question":
        return "border-purple-200 bg-purple-50"
      case "connection":
        return "border-orange-200 bg-orange-50"
      case "forgotten_idea":
        return "border-amber-200 bg-amber-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading insights...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            Insights
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadInsights}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-center py-4">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500 opacity-50" />
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={loadInsights}>
              Try Again
            </Button>
          </div>
        )}

        {message && !error && (
          <div className="text-center py-4">
            <AlertCircle size={48} className="mx-auto mb-4 text-blue-500 opacity-50" />
            <p className="text-sm text-blue-600 mb-2">{message}</p>
            <Button variant="outline" size="sm" onClick={loadInsights}>
              Refresh
            </Button>
          </div>
        )}

        {!error && !message && insights.length === 0 && (
          <div className="text-center py-8">
            <Brain size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 mb-2">No insights yet</p>
            <p className="text-sm text-gray-400 mb-4">Keep using Maxwell to build your thought patterns!</p>
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">💡 Tips:</p>
              <p>• Start conversations with Maxwell</p>
              <p>• Take notes about your thoughts</p>
              <p>• Ask questions about your goals</p>
            </div>
          </div>
        )}

        {insights.length > 0 && (
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight) => (
              <div
                key={insight.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${getInsightColor(insight.type)} ${
                  selectedInsight?.id === insight.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedInsight(selectedInsight?.id === insight.id ? null : insight)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(insight.confidence * 100)}%
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {insight.type}
                    </Badge>
                  </div>
                </div>

                {selectedInsight?.id === insight.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Evidence:</h5>
                    <div className="space-y-1">
                      {insight.evidence.slice(0, 3).map((evidence, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-white p-2 rounded border">
                          {evidence.length > 100 ? `${evidence.slice(0, 100)}...` : evidence}
                        </div>
                      ))}
                    </div>
                    {insight.actionable && (
                      <div className="mt-2">
                        <Badge variant="default" className="text-xs">
                          Actionable
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
