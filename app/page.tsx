"use client"

import { useState, useEffect } from "react"
import { ChatForm } from "@/components/chat-form"
import { SignIn } from "@/components/sign-in"
import { ErrorBoundary } from "@/components/error-boundary"

export default function Page() {
  const [isSignedIn, setIsSignedIn] = useState(false)

  // Check if user was previously signed in
  useEffect(() => {
    const savedAuthState = localStorage.getItem("maxwell-auth-state")
    if (savedAuthState === "signed-in") {
      setIsSignedIn(true)
    }
  }, [])

  const handleSignIn = (email: string, password: string) => {
    // In a real app, you would validate credentials with your backend
    // For demo purposes, we'll just set the signed-in state
    localStorage.setItem("maxwell-auth-state", "signed-in")
    setIsSignedIn(true)
  }

  const handleSignOut = () => {
    localStorage.removeItem("maxwell-auth-state")
    setIsSignedIn(false)
  }

  return (
    <ErrorBoundary>
      {isSignedIn ? <ChatForm onSignOut={handleSignOut} /> : <SignIn onSignIn={handleSignIn} />}
    </ErrorBoundary>
  )
}
