"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface SignInProps {
  onSignIn: (email: string, password: string) => void
}

export function SignIn({ onSignIn }: SignInProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    // Check if the email is authorized
    if (email.toLowerCase() !== "maxlangsam534@gmail.com") {
      setError("Access denied. Please contact maxlangsam534@gmail.com to request access.")
      return
    }

    setIsLoading(true)

    try {
      // For demo purposes, we'll just simulate a successful login
      // In a real app, you would validate credentials with your backend
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSignIn(email, password)
    } catch (err) {
      setError("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            M
          </div>
          <CardTitle className="text-2xl font-bold text-center">Maxwell</CardTitle>
          <CardDescription className="text-center">Your personal AI assistant</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="p-0 h-auto text-sm" type="button">
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert className="bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
              <AlertDescription className="text-sm">
                <strong>Testing Phase:</strong> Maxwell is currently in testing. To request access, please contact{" "}
                <a href="mailto:maxlangsam534@gmail.com" className="font-medium underline">
                  maxlangsam534@gmail.com
                </a>
                . Currently, only authorized users can sign in.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
