"use client"

import { cn } from "@/lib/utils"
import { useRef, useEffect, type TextareaHTMLAttributes } from "react"

interface AutoResizeTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
  maxHeight?: number
}

export function AutoResizeTextarea({ className, value, onChange, maxHeight = 200, ...props }: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resizeTextarea = () => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto"

      // Calculate new height but cap it at maxHeight
      const newHeight = Math.min(textarea.scrollHeight, maxHeight)
      textarea.style.height = `${newHeight}px`

      // Enable scrolling if content exceeds maxHeight
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden"
    }
  }

  // Resize on value change
  useEffect(() => {
    resizeTextarea()
  }, [value])

  // Resize on window resize
  useEffect(() => {
    const handleResize = () => resizeTextarea()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <textarea
      {...props}
      value={value}
      ref={textareaRef}
      rows={1}
      onChange={(e) => {
        onChange(e.target.value)
      }}
      className={cn(
        "resize-none min-h-[2.5rem] overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
        className,
      )}
      style={{ maxHeight: `${maxHeight}px` }}
    />
  )
}
