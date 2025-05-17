"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatMessage } from "./chat-message"
import { ThinkingAnimation } from "./thinking-animation"
import { AgentMiniProfile } from "./agent-mini-profile"

export interface ChatInterfaceProps {
  className?: string
  showHeader?: boolean
  showClearButton?: boolean
  placeholder?: string
  maxHeight?: string
  onAgentProfileClick?: () => void
}

export function ChatInterface({
  className,
  showHeader = true,
  showClearButton = true,
  placeholder = "Type your message...",
  maxHeight = "70vh",
  onAgentProfileClick,
}: ChatInterfaceProps) {
  const {
    messages,
    isThinking,
    thinkingStartTime,
    inputValue,
    agentContext,
    currentChatId,
    setInputValue,
    sendMessage,
    clearChat,
  } = useChat()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  // Focus input on mount
  useEffect(() => {
    if (!isMobile) {
      inputRef.current?.focus()
    }
  }, [isMobile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isThinking) {
      sendMessage(inputValue)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200",
        className,
      )}
      style={{ maxHeight }}
    >
      {/* Chat header */}
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white text-gray-900">
          <div className="flex items-center flex-1">
            {agentContext && <AgentMiniProfile agent={agentContext} onClick={onAgentProfileClick} />}
          </div>
          {showClearButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                clearChat()
                // Focus the input field after clearing the chat
                setTimeout(() => inputRef.current?.focus(), 0)
              }}
              className="text-gray-500 hover:bg-gray-100 ml-2"
              aria-label="Clear chat"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-center">
              {agentContext ? `Start chatting with ${agentContext.agentName}` : "Select an agent to start chatting"}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex w-full">
              {message.role === "assistant" ? (
                <div className="flex items-start max-w-full">
                  {agentContext?.agentImage && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 mt-1">
                      <Image
                        src={agentContext.agentImage || "/placeholder.svg"}
                        alt={agentContext.agentName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <ChatMessage message={message} className="flex-1" />
                </div>
              ) : (
                <div className="flex justify-end w-full">
                  <ChatMessage message={message} />
                </div>
              )}
            </div>
          ))
        )}

        {isThinking && (
          <div className="flex items-start">
            {agentContext?.agentImage && (
              <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <Image
                  src={agentContext.agentImage || "/placeholder.svg"}
                  alt={agentContext.agentName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <ThinkingAnimation startTime={thinkingStartTime} className="flex-1" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={isThinking || !agentContext}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isThinking || !agentContext}
            className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 hover:from-blue-600 hover:via-purple-700 hover:to-pink-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
