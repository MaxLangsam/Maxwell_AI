"use client"

import { useState, useRef, useEffect } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSettings } from "@/hooks/use-settings"

interface CodeBlockProps {
  language: string
  value: string
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const { settings } = useSettings()
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  const handleCopy = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Apply syntax highlighting if enabled
  useEffect(() => {
    if (settings.codeSyntaxHighlighting && preRef.current) {
      // In a real implementation, you would use a library like Prism.js or highlight.js
      // For simplicity, we're just adding a class here
      const codeElement = preRef.current.querySelector("code")
      if (codeElement) {
        codeElement.className = `language-${language}`
      }
    }
  }, [language, settings.codeSyntaxHighlighting, value])

  return (
    <div className="relative group">
      <pre
        ref={preRef}
        className={cn(
          "p-4 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-x-auto",
          settings.codeSyntaxHighlighting && "syntax-highlighted",
        )}
      >
        <code className={`language-${language}`}>{value}</code>
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      {language && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          {language}
        </div>
      )}
    </div>
  )
}
