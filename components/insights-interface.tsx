"use client"

import { useState, useEffect } from "react"
import { BarChart, LineChart, PieChart, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface InsightData {
  type: string
  title: string
  value: number
  change: number
  period: string
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

export function InsightsInterface() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("week")
  const [searchTerm, setSearchTerm] = useState("")
  const [insightData, setInsightData] = useState<InsightData[]>([])
  const [chartData, setChartData] = useState<Record<string, ChartData>>({})

  // Simulate loading data
  useEffect(() => {
    // Mock data for insights
    const mockInsights: InsightData[] = [
      {
        type: "conversations",
        title: "Total Conversations",
        value: 124,
        change: 12,
        period: "week",
      },
      {
        type: "messages",
        title: "Messages Exchanged",
        value: 1458,
        change: 8,
        period: "week",
      },
      {
        type: "topics",
        title: "Popular Topics",
        value: 5,
        change: 2,
        period: "week",
      },
      {
        type: "sentiment",
        title: "Positive Sentiment",
        value: 78,
        change: -3,
        period: "week",
      },
    ]

    // Mock chart data
    const mockChartData: Record<string, ChartData> = {
      conversations: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Conversations",
            data: [12, 19, 15, 22, 18, 25, 13],
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "rgb(59, 130, 246)",
          },
        ],
      },
      sentiment: {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [
          {
            label: "Sentiment Distribution",
            data: [65, 25, 10],
            backgroundColor: ["rgba(34, 197, 94, 0.6)", "rgba(234, 179, 8, 0.6)", "rgba(239, 68, 68, 0.6)"],
          },
        ],
      },
      topics: {
        labels: ["Coding", "Writing", "Research", "Design", "Business"],
        datasets: [
          {
            label: "Topic Distribution",
            data: [35, 25, 15, 10, 15],
            backgroundColor: [
              "rgba(59, 130, 246, 0.6)",
              "rgba(168, 85, 247, 0.6)",
              "rgba(236, 72, 153, 0.6)",
              "rgba(34, 197, 94, 0.6)",
              "rgba(245, 158, 11, 0.6)",
            ],
          },
        ],
      },
    }

    setInsightData(mockInsights)
    setChartData(mockChartData)
  }, [timeRange])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Insights</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insightData.map((insight) => (
              <Card key={insight.type}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insight.value}</div>
                  <p
                    className={`text-sm ${
                      insight.change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {insight.change > 0 ? "+" : ""}
                    {insight.change}% from last {insight.period}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Trends</CardTitle>
                <CardDescription>Daily conversation activity</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                  <LineChart size={32} className="text-gray-400" />
                  <p className="ml-2 text-gray-500">Chart visualization would appear here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Topic Distribution</CardTitle>
                <CardDescription>Most discussed topics</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                  <PieChart size={32} className="text-gray-400" />
                  <p className="ml-2 text-gray-500">Chart visualization would appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent conversations and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                      {i}
                    </div>
                    <div>
                      <h4 className="font-medium">Conversation about {["coding", "writing", "research"][i - 1]}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{["Python", "JavaScript", "Research"][i - 1]}</Badge>
                        <Badge variant="secondary">{["Tutorial", "Help", "Analysis"][i - 1]}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Analytics</CardTitle>
              <CardDescription>Detailed analysis of your conversations</CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <BarChart size={32} className="text-gray-400" />
                <p className="ml-2 text-gray-500">Conversation analytics would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Topic Analysis</CardTitle>
              <CardDescription>Breakdown of conversation topics</CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <PieChart size={32} className="text-gray-400" />
                <p className="ml-2 text-gray-500">Topic analysis would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>Emotional tone of your conversations</CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <LineChart size={32} className="text-gray-400" />
                <p className="ml-2 text-gray-500">Sentiment analysis would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
