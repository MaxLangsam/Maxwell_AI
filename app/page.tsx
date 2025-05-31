"use client"

import { useState, useEffect } from "react"
import { ChatForm } from "@/components/chat-form"
import { SignIn } from "@/components/sign-in"
import { ErrorBoundary } from "@/components/error-boundary"

export default function Page() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [authorizedEmail, setAuthorizedEmail] = useState("")

  // Check if user was previously signed in
  useEffect(() => {
    const savedAuthState = localStorage.getItem("maxwell-auth-state")
    const savedEmail = localStorage.getItem("maxwell-auth-email")

    if (savedAuthState === "signed-in" && savedEmail === "maxlangsam534@gmail.com") {
      setIsSignedIn(true)
    } else {
      // Clear any invalid auth state
      localStorage.removeItem("maxwell-auth-state")
      localStorage.removeItem("maxwell-auth-email")
      setIsSignedIn(false)
    }
  }, [])

  const handleSignIn = (email: string, password: string) => {
    // Only allow the authorized email
    if (email.toLowerCase() === "maxlangsam534@gmail.com") {
      localStorage.setItem("maxwell-auth-state", "signed-in")
      localStorage.setItem("maxwell-auth-email", email.toLowerCase())
      setIsSignedIn(true)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem("maxwell-auth-state")
    localStorage.removeItem("maxwell-auth-email")
    setIsSignedIn(false)
  }

  return (
    <ErrorBoundary>
      {isSignedIn ? <ChatForm onSignOut={handleSignOut} /> : <SignIn onSignIn={handleSignIn} />}
    </ErrorBoundary>
  )
}
