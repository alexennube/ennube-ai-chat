"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

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

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [agentContext, setAgentContext] = useState<AgentContext | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !agentContext) return

      // Create user message
      const userMessage = {
        id: uuidv4(),
        content,
        role: "user" as const,
        timestamp: Date.now(),
      }

      // Add user message to chat
      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
      setIsThinking(true)

      try {
        // Format messages for API
        const formattedMessages = messages.map((msg) => ({
          content: msg.content,
          role: msg.role,
        }))

        // Add the current user message
        formattedMessages.push({
          content,
          role: "user",
        })

        let responseContent = ""

        // Check if agent has a webhook URL
        if (agentContext.webhookUrl) {
          try {
            // Set up timeout for webhook requests
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

            console.log("Sending to webhook:", {
              message: content,
              agentId: agentContext.agentId,
              userId: "user123",
              conversationId: "conv_" + Date.now(),
            })

            const response = await fetch(agentContext.webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                message: content,
                agentId: agentContext.agentId,
                userId: "user123",
                conversationId: "conv_" + Date.now(),
                messages: formattedMessages,
              }),
              signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
              console.error(`Webhook error: ${response.status}`)
              throw new Error(`Webhook error: ${response.status}`)
            }

            const responseText = await response.text()
            console.log("Raw webhook response:", responseText)

            try {
              const data = JSON.parse(responseText)
              console.log("Webhook JSON response:", data)

              // Extract the response text, supporting multiple possible formats
              responseContent =
                data.output ||
                data.response ||
                data.text ||
                data.content ||
                data.message ||
                (typeof data === "string" ? data : JSON.stringify(data))
            } catch (jsonError) {
              console.log("Not a JSON response, using raw text")
              responseContent = responseText
            }
          } catch (error) {
            console.error("Webhook error:", error)
            responseContent = `I'm having trouble connecting to the ${agentContext.agentName} service right now. Please try again in a moment.`
          }
        } else {
          // Use the API route for agents without webhooks
          try {
            const response = await fetch("/api/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: formattedMessages,
                agent: agentContext.agentId,
              }),
            })

            if (!response.ok) {
              throw new Error(`API error: ${response.status}`)
            }

            const data = await response.json()
            responseContent = data.text || "The agent didn't provide a response."
          } catch (error) {
            console.error("API error:", error)
            responseContent = "I'm having trouble processing your request right now. Please try again in a moment."
          }
        }

        // Create AI response
        const aiResponse = {
          id: uuidv4(),
          content: responseContent,
          role: "assistant" as const,
          timestamp: Date.now(),
        }

        // Add AI response to chat
        setMessages((prev) => [...prev, aiResponse])
      } catch (error) {
        console.error("Error sending message:", error)
        // Add error message
        const errorMessage = {
          id: uuidv4(),
          content: "Sorry, there was an error processing your request. Please try again.",
          role: "assistant" as const,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsThinking(false)
      }
    },
    [agentContext, messages],
  )

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

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

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
