"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeBlockProps {
  language: string
  value: string
  showLineNumbers?: boolean
}

export function CodeBlock({ language, value, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  const lines = value.split("\n")

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 text-gray-200 px-4 py-2 rounded-t-lg">
        <span className="text-sm font-medium">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
          onClick={copyToClipboard}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
      </div>
      <div className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
        <pre className="text-sm">
          <code>
            {showLineNumbers ? (
              <div className="flex">
                <div className="select-none text-gray-500 pr-4 text-right min-w-[2rem]">
                  {lines.map((_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>
                <div className="flex-1">
                  {lines.map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              </div>
            ) : (
              value
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}
