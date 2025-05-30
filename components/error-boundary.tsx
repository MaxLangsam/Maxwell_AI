"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Something went wrong</h2>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4 overflow-auto max-h-60">
                <p className="font-mono text-sm">{this.state.error?.toString()}</p>
              </div>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null })
                  window.location.reload()
                }}
                className="w-full"
              >
                <RefreshCw size={16} className="mr-2" />
                Reload Application
              </Button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
