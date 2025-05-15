"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

// Simple interfaces
export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: number
}

export interface AgentContext {
  agentId: string
  agentName: string
  agentDescription: string
  agentImage?: string
  capabilities?: string[]
  webhookUrl?: string
}

interface ChatContextType {
  messages: Message[]
  inputValue: string
  isThinking: boolean
  agentContext: AgentContext | null
  setInputValue: (value: string) => void
  setAgentContext: (context: AgentContext | null) => void
  sendMessage: (content: string) => void
  clearChat: () => void
}

// Create context with undefined default
const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Simple ID generator instead of uuid
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // Basic state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [agentContext, setAgentContext] = useState<AgentContext | null>(null)

  // Simplified send message function
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !agentContext) return

      // Add user message
      const userMessage = {
        id: generateId(),
        content,
        role: "user" as const,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
      setIsThinking(true)

      // Simple timeout to simulate response
      setTimeout(() => {
        const aiResponse = {
          id: generateId(),
          content: `This is a simulated response from ${agentContext.agentName}. Webhook functionality is temporarily disabled.`,
          role: "assistant" as const,
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, aiResponse])
        setIsThinking(false)
      }, 1000)
    },
    [agentContext],
  )

  // Simple clear chat function
  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  // Context value
  const value = {
    messages,
    inputValue,
    isThinking,
    agentContext,
    setInputValue,
    setAgentContext,
    sendMessage,
    clearChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

// Hook to use the chat context
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
