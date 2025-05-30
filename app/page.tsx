"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { AuthForm } from "@/components/auth/auth-form"
import { ChatForm } from "@/components/chat-form"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function Page() {
  const { user, loading, error, signOut } = useAuth()
  const [userStatus, setUserStatus] = useState<"loading" | "pending" | "approved" | "admin" | "error">("loading")
  const [statusError, setStatusError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (user && !loading) {
      checkUserStatus()
    } else if (!loading && !user) {
      setUserStatus("pending")
    }
  }, [user, loading])

  const checkUserStatus = async () => {
    if (!user) return

    try {
      setStatusError(null)

      if (user.email === "maxlangsam534@gmail.com") {
        setUserStatus("admin")
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_approved")
        .eq("id", user.id)
        .single()

      if (profileData && !profileError) {
        if (profileData.is_approved) {
          setUserStatus("approved")
        } else {
          setUserStatus("pending")
        }
      } else {
        setUserStatus("pending")
      }
    } catch (error) {
      console.error("Error checking user status:", error)
      setStatusError(error instanceof Error ? error.message : "Failed to check user status")

      if (user.email === "maxlangsam534@gmail.com") {
        setUserStatus("admin")
      } else {
        setUserStatus("error")
      }
    }
  }

  const handleRetry = () => {
    setUserStatus("loading")
    setStatusError(null)
    if (user) {
      checkUserStatus()
    }
  }

  if (loading || userStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Loading Maxwell...</h3>
              <p className="text-sm text-gray-600 mt-2">
                {loading ? "Connecting to authentication..." : "Checking your access..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || (userStatus === "error" && user?.email !== "maxlangsam534@gmail.com")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-red-600">Connection Error</CardTitle>
                <CardDescription>Unable to connect to Maxwell</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error ||
                  statusError ||
                  "Failed to connect to the database. Please check your internet connection and try again."}
              </AlertDescription>
            </Alert>
            <Button onClick={handleRetry} className="w-full" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (userStatus === "admin" || userStatus === "approved") {
    return <ChatForm />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pending Approval
              </CardTitle>
              <CardDescription>Your account is awaiting admin approval</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your account has been created successfully! Please wait for an administrator to approve your access to
            Maxwell.
          </p>
          <div className="text-sm text-gray-500">Signed in as: {user.email}</div>
          <div className="flex gap-2">
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Status
            </Button>
            <Button onClick={signOut} variant="outline" className="flex-1">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
