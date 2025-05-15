"use client"

import { useState } from "react"
import { ChatProvider, useChat } from "@/contexts/chat-context"
import { MenuBar } from "@/components/menu-bar"
import { ChatInterface } from "@/components/chat-interface"
import { AgentSelector } from "@/components/agent-selector"
import AgentProfile from "@/components/agent-profile"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { AgentContext } from "@/contexts/chat-context"

export default function ChatPage() {
  const [showProfile, setShowProfile] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentContext | null>(null)
  const [showAgentPanel, setShowAgentPanel] = useState(true)

  return (
    <ChatProvider>
      <ChatPageContent
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        showAgentPanel={showAgentPanel}
        setShowAgentPanel={setShowAgentPanel}
      />
    </ChatProvider>
  )
}

function ChatPageContent({
  showProfile,
  setShowProfile,
  selectedAgent,
  setSelectedAgent,
  showAgentPanel,
  setShowAgentPanel,
}: {
  showProfile: boolean
  setShowProfile: (show: boolean) => void
  selectedAgent: AgentContext | null
  setSelectedAgent: (agent: AgentContext | null) => void
  showAgentPanel: boolean
  setShowAgentPanel: (show: boolean) => void
}) {
  const { clearChat } = useChat()

  const handleShowProfile = (agent: AgentContext) => {
    setSelectedAgent(agent)
    setShowProfile(true)
  }

  const handleBackToSelector = () => {
    setShowProfile(false)
  }

  const handleCloseAgentPanel = () => {
    setShowAgentPanel(false)
  }

  const handleViewAllAgents = () => {
    setShowAgentPanel(true)
    setShowProfile(false)
  }

  const handleAgentProfileClick = () => {
    if (!showAgentPanel) {
      setShowAgentPanel(true)
    }
    if (selectedAgent) {
      setShowProfile(true)
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <MenuBar onViewAllAgents={handleViewAllAgents} />

      {/* Agent Demo Banner */}
      <div className="bg-gray-100 py-1 px-4 text-center border-b border-gray-200">
        <span className="text-gray-700 text-sm font-medium">Agent Demo</span>
      </div>

      <main className="flex-1 overflow-hidden p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
          {showAgentPanel && (
            <div className="md:col-span-1 h-full overflow-auto">
              {showProfile && selectedAgent ? (
                <AgentProfile
                  agent={selectedAgent}
                  onBack={handleBackToSelector}
                  onClose={handleCloseAgentPanel}
                  onClearChat={clearChat}
                />
              ) : (
                <AgentSelector onShowProfile={handleShowProfile} onClose={handleCloseAgentPanel} />
              )}
            </div>
          )}
          <div className={showAgentPanel ? "md:col-span-3" : "md:col-span-4"}>
            <ChatInterface maxHeight="calc(100vh - 140px)" onAgentProfileClick={handleAgentProfileClick} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
