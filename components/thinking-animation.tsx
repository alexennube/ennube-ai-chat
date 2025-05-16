"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface ThinkingAnimationProps {
  startTime?: number
  className?: string
}

export function ThinkingAnimation({ startTime = Date.now(), className }: ThinkingAnimationProps) {
  const [thinkingText, setThinkingText] = useState("Thinking")

  useEffect(() => {
    const updateThinkingText = () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)

      if (elapsedSeconds >= 120) {
        setThinkingText("Thinking Really Hard")
      } else if (elapsedSeconds >= 60) {
        setThinkingText("Thinking Hard")
      } else {
        setThinkingText("Thinking")
      }
    }

    // Update immediately and then every second
    updateThinkingText()
    const intervalId = setInterval(updateThinkingText, 1000)

    return () => clearInterval(intervalId)
  }, [startTime])

  return (
    <div className={cn("flex items-start", className)}>
      <div className="max-w-[80%] bg-gray-100 text-gray-900 rounded-lg px-4 py-2 border border-gray-200">
        <div className="flex items-center space-x-2">
          <span>{thinkingText}</span>
          <span className="flex space-x-1">
            <span className="animate-bounce delay-0 h-1 w-1 rounded-full bg-gray-500"></span>
            <span className="animate-bounce delay-150 h-1 w-1 rounded-full bg-gray-500"></span>
            <span className="animate-bounce delay-300 h-1 w-1 rounded-full bg-gray-500"></span>
          </span>
        </div>
      </div>
    </div>
  )
}
