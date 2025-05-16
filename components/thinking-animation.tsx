"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface ThinkingAnimationProps {
  startTime?: number
  className?: string
}

export function ThinkingAnimation({ startTime = Date.now(), className }: ThinkingAnimationProps) {
  const [thinkingText, setThinkingText] = useState("Thinking")
  const [dots, setDots] = useState("...")

  useEffect(() => {
    const updateThinkingText = () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)

      if (elapsedSeconds >= 120) {
        setThinkingText("Still Processing")
      } else if (elapsedSeconds >= 60) {
        setThinkingText("Processing Request")
      } else if (elapsedSeconds >= 30) {
        setThinkingText("Working on It")
      } else {
        setThinkingText("Thinking")
      }
    }

    // Update dots animation
    const updateDots = () => {
      setDots((prev) => {
        if (prev === "...") return "."
        if (prev === ".") return ".."
        if (prev === "..") return "..."
        return "."
      })
    }

    // Update immediately and then every second for thinking text
    updateThinkingText()
    const textIntervalId = setInterval(updateThinkingText, 5000)

    // Update dots every 500ms
    const dotsIntervalId = setInterval(updateDots, 500)

    return () => {
      clearInterval(textIntervalId)
      clearInterval(dotsIntervalId)
    }
  }, [startTime])

  return (
    <div className={cn("flex items-start", className)}>
      <div className="max-w-[80%] bg-gray-100 text-gray-900 rounded-lg px-4 py-2 border border-gray-200">
        <div className="flex items-center space-x-2">
          <span>
            {thinkingText}
            {dots}
          </span>
        </div>
      </div>
    </div>
  )
}
