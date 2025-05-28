"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { LinkPreview } from "./link-preview"

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

  // Format the message content to render bold text and links
  const formatContent = (content: string) => {
    // First, let's handle line breaks
    const lines = content.split("\n")

    return lines.map((line, lineIndex) => {
      // Check if this line contains a markdown link
      const linkRegex = /\[([^\]]+)\]$$([^)]+)$$/g
      const boldRegex = /\*\*([^*]+)\*\*/g

      // Create an array of parts with their types
      const parts: Array<{ type: "text" | "bold" | "link"; content: string; url?: string }> = []
      let lastIndex = 0
      let match

      // Find all matches (both bold and links) and sort them by position
      const matches: Array<{ start: number; end: number; type: "bold" | "link"; content: string; url?: string }> = []

      // Find bold matches
      boldRegex.lastIndex = 0
      while ((match = boldRegex.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: "bold",
          content: match[1],
        })
      }

      // Find link matches
      linkRegex.lastIndex = 0
      while ((match = linkRegex.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: "link",
          content: match[1],
          url: match[2],
        })
      }

      // Sort matches by start position
      matches.sort((a, b) => a.start - b.start)

      // Process matches
      matches.forEach((match) => {
        // Add text before this match
        if (match.start > lastIndex) {
          parts.push({
            type: "text",
            content: line.substring(lastIndex, match.start),
          })
        }

        // Add the match
        parts.push({
          type: match.type,
          content: match.content,
          url: match.url,
        })

        lastIndex = match.end
      })

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push({
          type: "text",
          content: line.substring(lastIndex),
        })
      }

      // If no matches were found, the entire line is text
      if (parts.length === 0) {
        parts.push({
          type: "text",
          content: line,
        })
      }

      // Render the parts
      return (
        <div key={lineIndex} className={lineIndex > 0 ? "mt-2" : ""}>
          {parts.map((part, partIndex) => {
            if (part.type === "bold") {
              return <strong key={partIndex}>{part.content}</strong>
            } else if (part.type === "link" && part.url) {
              // For assistant messages, show link preview
              if (!isUser) {
                return <LinkPreview key={partIndex} url={part.url} text={part.content} />
              }
              // For user messages, show inline link
              return (
                <a
                  key={partIndex}
                  href={part.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {part.content}
                </a>
              )
            } else {
              return <span key={partIndex}>{part.content}</span>
            }
          })}
        </div>
      )
    })
  }

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start", className)}>
      <div
        className={cn(
          "rounded-lg px-4 py-2 inline-block min-w-fit max-w-2xl",
          isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900 border border-gray-200",
        )}
      >
        <div className="whitespace-pre-wrap break-words">{formatContent(message.content)}</div>
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
