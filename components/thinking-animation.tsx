"use client"

import { cn } from "@/lib/utils"

export interface ThinkingAnimationProps {
  text?: string
  className?: string
}

export function ThinkingAnimation({ text = "Thinking", className }: ThinkingAnimationProps) {
  return (
    <div className={cn("flex items-start", className)}>
      <div className="max-w-[80%] bg-gray-100 text-gray-900 rounded-lg px-4 py-2 border border-gray-200">
        <div className="flex items-center space-x-2">
          <span>{text}</span>
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
