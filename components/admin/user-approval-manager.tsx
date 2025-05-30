"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  is_approved: boolean
  created_at: string
  approved_at: string | null
}

export function UserApprovalManager() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setError(null)
      setIsLoading(true)

      // Check if user is authorized (creator email)
      if (!user || user.email !== "maxlangsam534@gmail.com") {
        throw new Error("Unauthorized access")
      }

      // Get all user profiles
      const { data, error: queryError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (queryError) {
        throw queryError
      }

      setUsers(data || [])
    } catch (error: any) {
      console.error("Error loading users:", error)
      setError(error.message || "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const updateApprovalStatus = async (userId: string, approved: boolean) => {
    try {
      setError(null)

      // Check authorization
      if (!user || user.email !== "maxlangsam534@gmail.com") {
        throw new Error("Unauthorized")
      }

      const updateData: any = {
        is_approved: approved,
        updated_at: new Date().toISOString(),
      }

      if (approved) {
        updateData.approved_at = new Date().toISOString()
        updateData.approved_by = user.id
      } else {
        updateData.approved_at = null
        updateData.approved_by = null
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", userId)

      if (error) throw error

      await loadUsers()
      toast({
        title: "Success",
        description: `User ${approved ? "approved" : "rejected"} successfully`,
      })
    } catch (error: any) {
      console.error("Error updating approval status:", error)
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive",
      })
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
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Approve or reject user access to Maxwell</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={loadUsers} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  const pendingUsers = users.filter((u) => !u.is_approved && u.email !== "maxlangsam534@gmail.com")
  const approvedUsers = users.filter((u) => u.is_approved && u.email !== "maxlangsam534@gmail.com")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Approve or reject user access to Maxwell</p>
        </div>
        <Button onClick={loadUsers} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Pending Users */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pending Approval ({pendingUsers.length})</h3>
        {pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No users pending approval</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((userProfile) => (
              <Card key={userProfile.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{userProfile.full_name || "No name provided"}</CardTitle>
                      <CardDescription>{userProfile.email}</CardDescription>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-xs text-gray-500">
                      Signed up: {new Date(userProfile.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateApprovalStatus(userProfile.id, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button onClick={() => updateApprovalStatus(userProfile.id, false)} variant="destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approved Users */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Approved Users ({approvedUsers.length})</h3>
        {approvedUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No approved users yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {approvedUsers.map((userProfile) => (
              <Card key={userProfile.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{userProfile.full_name || "No name provided"}</CardTitle>
                      <CardDescription>{userProfile.email}</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Approved</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      Approved:{" "}
                      {userProfile.approved_at ? new Date(userProfile.approved_at).toLocaleDateString() : "N/A"}
                    </div>
                    <Button onClick={() => updateApprovalStatus(userProfile.id, false)} variant="outline" size="sm">
                      Revoke Access
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
