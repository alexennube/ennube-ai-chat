"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
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
  statusWebhookUrl?: string // New field for status checking webhook
}

export interface SavedChat {
  id: string
  title: string
  timestamp: number
  messages: Message[]
  agentContext: AgentContext | null
  preview: string
  jobId?: string // Store jobId for async processing
}

interface ChatContextType {
  messages: Message[]
  inputValue: string
  isThinking: boolean
  thinkingStartTime: number
  agentContext: AgentContext | null
  savedChats: SavedChat[]
  currentChatId: string | null
  setInputValue: (value: string) => void
  setAgentContext: (context: AgentContext | null) => void
  sendMessage: (content: string) => void
  clearChat: () => void
  saveCurrentChat: () => void
  loadChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Helper function to generate a title from messages
const generateChatTitle = (messages: Message[], agentName: string | null): string => {
  if (messages.length === 0) return `New chat with ${agentName || "AI"}`

  // Get the first user message
  const firstUserMessage = messages.find((msg) => msg.role === "user")
  if (firstUserMessage) {
    // Truncate to first 30 chars
    const title = firstUserMessage.content.substring(0, 30)
    return title.length < firstUserMessage.content.length ? `${title}...` : title
  }

  return `Chat with ${agentName || "AI"} - ${new Date().toLocaleDateString()}`
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingStartTime, setThinkingStartTime] = useState(Date.now())
  const [agentContext, setAgentContext] = useState<AgentContext | null>(null)
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [activePollingJobId, setActivePollingJobId] = useState<string | null>(null)
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null)

  // Load saved chats from localStorage on mount
  useEffect(() => {
    const storedChats = localStorage.getItem("savedChats")
    if (storedChats) {
      try {
        setSavedChats(JSON.parse(storedChats))
      } catch (e) {
        console.error("Error loading saved chats:", e)
      }
    }
  }, [])

  // Save chats to localStorage when they change
  useEffect(() => {
    if (savedChats.length > 0) {
      localStorage.setItem("savedChats", JSON.stringify(savedChats))
    }
  }, [savedChats])

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId)
      }
    }
  }, [pollingIntervalId])

  // Auto-save current chat when messages change
  useEffect(() => {
    if (messages.length > 0 && agentContext) {
      const autoSaveChat = () => {
        const chatId = currentChatId || uuidv4()

        // Create preview from last message
        const lastMessage = messages[messages.length - 1]
        const preview = lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? "..." : "")

        // Get the current chat to preserve jobId if it exists
        const existingChat = savedChats.find((chat) => chat.id === chatId)
        const jobId = existingChat?.jobId

        // Create or update the chat
        const chatToSave: SavedChat = {
          id: chatId,
          title: generateChatTitle(messages, agentContext?.agentName),
          timestamp: Date.now(),
          messages: [...messages],
          agentContext,
          preview,
          jobId, // Preserve jobId if it exists
        }

        setSavedChats((prevChats) => {
          // Check if this chat already exists
          const existingChatIndex = prevChats.findIndex((chat) => chat.id === chatId)

          if (existingChatIndex >= 0) {
            // Update existing chat
            const updatedChats = [...prevChats]
            updatedChats[existingChatIndex] = chatToSave
            return updatedChats
          } else {
            // Add new chat, keeping only the most recent 10
            return [chatToSave, ...prevChats].slice(0, 10)
          }
        })

        // Set current chat ID
        setCurrentChatId(chatId)
      }

      // Debounce auto-save to avoid excessive localStorage writes
      const timeoutId = setTimeout(autoSaveChat, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [messages, agentContext, currentChatId, savedChats])

  // Function to update the jobId for the current chat
  const updateJobId = useCallback(
    (jobId: string) => {
      if (!currentChatId) return

      setSavedChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.id === currentChatId) {
            return { ...chat, jobId }
          }
          return chat
        })
      })
    },
    [currentChatId],
  )

  // Function to poll for job status
  const pollJobStatus = useCallback(async (jobId: string, statusWebhookUrl: string) => {
    try {
      const response = await fetch(statusWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      })

      if (!response.ok) {
        console.error(`Status webhook error: ${response.status}`)
        return null
      }

      const responseText = await response.text()

      try {
        const data = JSON.parse(responseText)
        console.log("Status webhook response:", data)

        // Check if job is complete
        if (data.status === "completed" && data.output) {
          return data.output
        }

        // Still processing
        return null
      } catch (jsonError) {
        console.error("Error parsing status response:", jsonError)
        return null
      }
    } catch (error) {
      console.error("Error polling job status:", error)
      return null
    }
  }, [])

  // Function to start polling
  const startPolling = useCallback(
    (jobId: string, statusWebhookUrl: string) => {
      // Clear any existing polling
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId)
      }

      setActivePollingJobId(jobId)

      // Set a timeout for the entire polling process (3 minutes)
      const pollingTimeout = setTimeout(
        () => {
          if (pollingIntervalId) {
            clearInterval(pollingIntervalId)
            setPollingIntervalId(null)
            setIsThinking(false)

            // Add timeout message
            const timeoutMessage = {
              id: uuidv4(),
              content: "I'm sorry, but I couldn't get a response in time. Please try again.",
              role: "assistant" as const,
              timestamp: Date.now(),
            }
            setMessages((prev) => [...prev, timeoutMessage])
          }
        },
        3 * 60 * 1000,
      ) // 3 minutes

      // Start polling every 5 seconds
      const intervalId = setInterval(async () => {
        if (!statusWebhookUrl) {
          clearInterval(intervalId)
          clearTimeout(pollingTimeout)
          return
        }

        const result = await pollJobStatus(jobId, statusWebhookUrl)

        if (result) {
          // We got a result, stop polling
          clearInterval(intervalId)
          clearTimeout(pollingTimeout)
          setPollingIntervalId(null)
          setIsThinking(false)
          setActivePollingJobId(null)

          // Add the response to messages
          const aiResponse = {
            id: uuidv4(),
            content: result,
            role: "assistant" as const,
            timestamp: Date.now(),
          }

          setMessages((prev) => [...prev, aiResponse])
        }
      }, 5000) // Poll every 5 seconds

      setPollingIntervalId(intervalId)

      return () => {
        clearInterval(intervalId)
        clearTimeout(pollingTimeout)
      }
    },
    [pollingIntervalId, pollJobStatus],
  )

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
      setThinkingStartTime(Date.now())

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

              // Check if this is an asynchronous job
              if (data.jobId && agentContext.statusWebhookUrl) {
                // Store the jobId
                updateJobId(data.jobId)

                // Start polling for status
                startPolling(data.jobId, agentContext.statusWebhookUrl)

                // Keep thinking state active
                return
              }

              // If not async, handle as normal
              const responseContent =
                data.output ||
                data.response ||
                data.text ||
                data.content ||
                data.message ||
                (typeof data === "string" ? data : JSON.stringify(data))

              // Create AI response
              const aiResponse = {
                id: uuidv4(),
                content: responseContent,
                role: "assistant" as const,
                timestamp: Date.now(),
              }

              // Add AI response to chat
              setMessages((prev) => [...prev, aiResponse])
              setIsThinking(false)
            } catch (jsonError) {
              console.log("Not a JSON response, using raw text")

              // Create AI response with raw text
              const aiResponse = {
                id: uuidv4(),
                content: responseText,
                role: "assistant" as const,
                timestamp: Date.now(),
              }

              // Add AI response to chat
              setMessages((prev) => [...prev, aiResponse])
              setIsThinking(false)
            }
          } catch (error) {
            console.error("Webhook error:", error)

            // Add error message
            const errorMessage = {
              id: uuidv4(),
              content: `I'm having trouble connecting to the ${agentContext.agentName} service right now. Please try again in a moment.`,
              role: "assistant" as const,
              timestamp: Date.now(),
            }

            setMessages((prev) => [...prev, errorMessage])
            setIsThinking(false)
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

            // Create AI response
            const aiResponse = {
              id: uuidv4(),
              content: data.text || "The agent didn't provide a response.",
              role: "assistant" as const,
              timestamp: Date.now(),
            }

            // Add AI response to chat
            setMessages((prev) => [...prev, aiResponse])
            setIsThinking(false)
          } catch (error) {
            console.error("API error:", error)

            // Add error message
            const errorMessage = {
              id: uuidv4(),
              content: "I'm having trouble processing your request right now. Please try again in a moment.",
              role: "assistant" as const,
              timestamp: Date.now(),
            }

            setMessages((prev) => [...prev, errorMessage])
            setIsThinking(false)
          }
        }
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
        setIsThinking(false)
      }
    },
    [agentContext, messages, updateJobId, startPolling],
  )

  const clearChat = useCallback(() => {
    // Clear any active polling
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId)
      setPollingIntervalId(null)
    }

    setMessages([])
    setCurrentChatId(null)
    setIsThinking(false)
    setActivePollingJobId(null)
  }, [pollingIntervalId])

  const saveCurrentChat = useCallback(() => {
    if (messages.length === 0 || !agentContext) return null

    const chatId = currentChatId || uuidv4()

    // Get the current chat to preserve jobId if it exists
    const existingChat = savedChats.find((chat) => chat.id === chatId)
    const jobId = existingChat?.jobId

    const chatToSave: SavedChat = {
      id: chatId,
      title: generateChatTitle(messages, agentContext.agentName),
      timestamp: Date.now(),
      messages: [...messages],
      agentContext,
      preview:
        messages[messages.length - 1].content.substring(0, 60) +
        (messages[messages.length - 1].content.length > 60 ? "..." : ""),
      jobId,
    }

    setSavedChats((prevChats) => {
      const existingChatIndex = prevChats.findIndex((chat) => chat.id === chatId)

      if (existingChatIndex >= 0) {
        // Update existing chat
        const updatedChats = [...prevChats]
        updatedChats[existingChatIndex] = chatToSave
        return updatedChats
      } else {
        // Add new chat, keeping only the most recent 10
        return [chatToSave, ...prevChats].slice(0, 10)
      }
    })

    setCurrentChatId(chatId)
    return chatId
  }, [messages, agentContext, currentChatId, savedChats])

  const loadChat = useCallback(
    (chatId: string) => {
      const chatToLoad = savedChats.find((chat) => chat.id === chatId)
      if (!chatToLoad) return

      // Clear any active polling
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId)
        setPollingIntervalId(null)
      }

      setMessages(chatToLoad.messages)
      setAgentContext(chatToLoad.agentContext)
      setCurrentChatId(chatId)
      setIsThinking(false)

      // If this chat has an active job, resume polling
      if (chatToLoad.jobId && chatToLoad.agentContext?.statusWebhookUrl) {
        setIsThinking(true)
        setThinkingStartTime(Date.now())
        startPolling(chatToLoad.jobId, chatToLoad.agentContext.statusWebhookUrl)
      }
    },
    [savedChats, pollingIntervalId, startPolling],
  )

  const deleteChat = useCallback(
    (chatId: string) => {
      // If deleting the active chat with polling, stop polling
      if (currentChatId === chatId && pollingIntervalId) {
        clearInterval(pollingIntervalId)
        setPollingIntervalId(null)
      }

      setSavedChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId))

      if (currentChatId === chatId) {
        clearChat()
      }
    },
    [currentChatId, clearChat, pollingIntervalId],
  )

  const value = {
    messages,
    inputValue,
    isThinking,
    thinkingStartTime,
    agentContext,
    savedChats,
    currentChatId,
    setInputValue,
    setAgentContext,
    sendMessage,
    clearChat,
    saveCurrentChat,
    loadChat,
    deleteChat,
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
