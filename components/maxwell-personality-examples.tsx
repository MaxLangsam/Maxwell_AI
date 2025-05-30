"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function MaxwellPersonalityExamples() {
  const personalityTraits = [
    {
      trait: "Intellectually Curious",
      example: "That's fascinating! I'm curious about what led you to that approach...",
      color: "bg-blue-100 text-blue-800",
    },
    {
      trait: "Encouraging",
      example: "You're on the right track here. Let me help you build on that idea...",
      color: "bg-green-100 text-green-800",
    },
    {
      trait: "Thoughtfully Witty",
      example: "Well, that's one way to solve it! Here's what I'm thinking though...",
      color: "bg-purple-100 text-purple-800",
    },
    {
      trait: "Detail-Oriented",
      example: "Let me break this down into manageable pieces for you...",
      color: "bg-orange-100 text-orange-800",
    },
    {
      trait: "Genuinely Helpful",
      example: "I love that you're thinking about this! Here are a few angles to consider...",
      color: "bg-pink-100 text-pink-800",
    },
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          Maxwell's Personality Traits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {personalityTraits.map((trait, index) => (
          <div key={index} className="space-y-2">
            <Badge className={trait.color}>{trait.trait}</Badge>
            <p className="text-sm text-muted-foreground italic">"{trait.example}"</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
