"use client"

import { useState, useEffect } from "react"
import { ChatProvider } from "@/contexts/chat-context"
import { ChatInterface } from "@/components/chat-interface"
import { AgentSelector } from "@/components/agent-selector"
import AgentProfile from "@/components/agent-profile"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { AgentContext } from "@/contexts/chat-context"

export interface EnnubeChatProps {
  /**
   * Custom agents to use in the chat
   */
  agents?: AgentContext[]
  /**
   * Initial agent to select
   */
  initialAgent?: AgentContext
  /**
   * Whether to show the header
   */
  showHeader?: boolean
  /**
   * Whether to show the footer
   */
  showFooter?: boolean
  /**
   * Whether to show the agent selector panel
   */
  showAgentPanel?: boolean
  /**
   * Custom CSS class for the container
   */
  className?: string
  /**
   * Height of the chat container
   */
  height?: string
  /**
   * Width of the chat container
   */
  width?: string
  /**
   * Custom logo URL for the header
   */
  logoUrl?: string
  /**
   * Custom title for the header
   */
  headerTitle?: string
  /**
   * Custom placeholder for the chat input
   */
  inputPlaceholder?: string
  /**
   * Callback when a message is sent
   */
  onMessageSent?: (message: string) => void
  /**
   * Callback when a message is received
   */
  onMessageReceived?: (message: string) => void
  /**
   * Callback when an agent is selected
   */
  onAgentSelected?: (agent: AgentContext) => void
}

/**
 * EnnubeChat - A complete chat interface with AI agents that can be dropped into any React application
 */
export function EnnubeChat({
  agents,
  initialAgent,
  showHeader = true,
  showFooter = true,
  showAgentPanel = true,
  className = "",
  height = "600px",
  width = "100%",
  logoUrl,
  headerTitle,
  inputPlaceholder,
  onMessageSent,
  onMessageReceived,
  onAgentSelected,
}: EnnubeChatProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentContext | null>(initialAgent || null)
  const [showAgentPanelState, setShowAgentPanelState] = useState(showAgentPanel)

  // Update state when props change
  useEffect(() => {
    setShowAgentPanelState(showAgentPanel)
  }, [showAgentPanel])

  useEffect(() => {
    if (initialAgent) {
      setSelectedAgent(initialAgent)
    }
  }, [initialAgent])

  return (
    <ChatProvider>
      <div
        className={`flex flex-col overflow-hidden border border-gray-200 rounded-lg shadow-lg ${className}`}
        style={{ height, width }}
      >
        {showHeader && <Header logoUrl={logoUrl} title={headerTitle} />}

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
              {showAgentPanelState && (
                <div className="md:col-span-1 h-full overflow-auto">
                  {showProfile && selectedAgent ? (
                    <AgentProfile
                      agent={selectedAgent}
                      onBack={() => setShowProfile(false)}
                      onClose={() => setShowAgentPanelState(false)}
                    />
                  ) : (
                    <AgentSelector
                      agents={agents}
                      initialAgentContext={initialAgent}
                      onShowProfile={(agent) => {
                        setSelectedAgent(agent)
                        setShowProfile(true)
                        if (onAgentSelected) {
                          onAgentSelected(agent)
                        }
                      }}
                      onClose={() => setShowAgentPanelState(false)}
                    />
                  )}
                </div>
              )}
              <div className={showAgentPanelState ? "md:col-span-3" : "md:col-span-4"}>
                <ChatInterface
                  maxHeight="100%"
                  onAgentProfileClick={() => {
                    if (selectedAgent) {
                      setShowProfile(true)
                      setShowAgentPanelState(true)
                    }
                  }}
                  placeholder={inputPlaceholder}
                  onMessageSent={onMessageSent}
                  onMessageReceived={onMessageReceived}
                />
              </div>
            </div>
          </div>
        </div>

        {showFooter && <Footer />}
      </div>
    </ChatProvider>
  )
}
