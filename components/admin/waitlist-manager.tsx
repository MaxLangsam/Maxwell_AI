"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

interface WaitlistEntry {
  id: string
  email: string
  name: string
  reason: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export function WaitlistManager() {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    loadWaitlistEntries()
  }, [])

  const loadWaitlistEntries = async () => {
    try {
      setError(null)
      setIsLoading(true)

      // Check if user is authorized (creator email)
      if (!user || user.email !== "maxlangsam534@gmail.com") {
        throw new Error("Unauthorized access")
      }

      // Simple query without RLS
      const { data, error: queryError } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false })

      if (queryError) {
        throw queryError
      }

      setWaitlistEntries(data || [])
    } catch (error: any) {
      console.error("Error loading waitlist:", error)
      setError(error.message || "Failed to load waitlist entries")
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (email: string, status: "approved" | "rejected") => {
    try {
      setError(null)

      // Check authorization
      if (!user || user.email !== "maxlangsam534@gmail.com") {
        throw new Error("Unauthorized")
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === "approved") {
        updateData.approved_at = new Date().toISOString()
        updateData.approved_by = user.id
      }

      const { error } = await supabase.from("waitlist").update(updateData).eq("email", email)

      if (error) throw error

      await loadWaitlistEntries()
      toast({
        title: "Success",
        description: `User ${status} successfully`,
      })
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: `Failed to ${status} user: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Check if user is authorized
  if (!user || user.email !== "maxlangsam534@gmail.com") {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You are not authorized to access the admin panel.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading waitlist...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Waitlist Management</h2>
          <p className="text-gray-600">Review and approve users for Maxwell access</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={loadWaitlistEntries} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Waitlist Management</h2>
          <p className="text-gray-600">Review and approve users for Maxwell access</p>
        </div>
        <Button onClick={loadWaitlistEntries} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {waitlistEntries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{entry.name}</CardTitle>
                  <CardDescription>{entry.email}</CardDescription>
                </div>
                <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Reason for joining:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{entry.reason}</p>
                </div>

                <div className="text-xs text-gray-500">Applied: {new Date(entry.created_at).toLocaleDateString()}</div>

                {entry.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateStatus(entry.email, "approved")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button onClick={() => updateStatus(entry.email, "rejected")} variant="destructive">
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {waitlistEntries.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No waitlist entries yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
