"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChatMessageProps {
  message: {
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: number
  }
  showTimestamp?: boolean
  showCopyButton?: boolean
  className?: string
}

export function ChatMessage({ message, showTimestamp = true, showCopyButton = true, className }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  const isUser = message.role === "user"

  // Format the message content to render bold text
  const formatContent = (content: string) => {
    // Split the content by bold markers
    const parts = content.split(/(\*\*[^*]+\*\*)/g)

    return parts.map((part, index) => {
      // Check if this part is bold text (surrounded by **)
      if (part.startsWith("**") && part.endsWith("**")) {
        // Extract the text without the ** markers
        const boldText = part.substring(2, part.length - 2)
        return <strong key={index}>{boldText}</strong>
      }
      // Return regular text as is
      return part
    })
  }

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start", className)}>
      <div
        className={cn(
          "rounded-lg px-4 py-2 inline-block min-w-fit",
          isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900 border border-gray-200",
        )}
      >
        <span className="whitespace-pre-wrap break-words">{formatContent(message.content)}</span>
      </div>

      <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
        {showTimestamp && <span>{formattedTime}</span>}

        {showCopyButton && (
          <button
            onClick={copyToClipboard}
            className="flex items-center hover:text-gray-700 transition-colors"
            aria-label="Copy message"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </div>
    </div>
  )
}
