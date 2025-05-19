"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { AgentContext } from "@/contexts/chat-context"

// Define the default agents
const defaultAgents: AgentContext[] = [
  {
    agentId: "prospect-finder",
    agentName: "Prospect Finder",
    agentDescription: "Track down high-quality prospects for the world's best tech teams",
    agentImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/prospect-finder.png-AMKsammwEXqXPXKAjO6moM5OeBK6Fb.jpeg",
    capabilities: [
      "Find potential customers",
      "Qualify leads",
      "Research companies",
      "Identify decision makers",
      "Build prospect lists",
    ],
    webhookUrl: "https://xucre-n8n-05603adf5e11.herokuapp.com/webhook/9c4ee75d-5f1c-46fc-a9ec-8201cb2a5f86/chat",
    // Make sure the status webhook URL is correct for GET requests
    statusWebhookUrl: "https://xucre-n8n-05603adf5e11.herokuapp.com/webhook/0f029070-665a-4ae3-9e91-a826f6b54407",
  },
  {
    agentId: "market-nurturer",
    agentName: "Market Nurturer",
    agentDescription: "Turn curiosity into confianza—then confianza into loyal customers",
    agentImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/market-nurturer-eiuHCLbwOxbMq8KhwWUjVh1BJsdcK8.png",
    capabilities: [
      "Content creation",
      "Email campaigns",
      "Social media strategy",
      "Lead nurturing",
      "Customer engagement",
    ],
    webhookUrl: "https://xucre-n8n-05603adf5e11.herokuapp.com/webhook/da86beb4-7865-4d08-8121-c6c7511839fd/chat",
    statusWebhookUrl: "https://xucre-n8n-05603adf5e11.herokuapp.com/webhook/06d643c9-908e-4bb6-b5f9-b9abcb54e917",
  },
  {
    agentId: "meetings-booker",
    agentName: "Meetings Booker",
    agentDescription: "Schedule meetings with prospects efficiently",
    agentImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/meetings-booker-PG5LtplN0rgc1py5gOKbxQkHojW8XW.png",
    capabilities: [
      "Schedule meetings",
      "Send invitations",
      "Handle follow-ups",
      "Manage calendars",
      "Coordinate time zones",
    ],
    webhookUrl: "https://xucre-n8n-05603adf5e11.herokuapp.com/webhook/e1479049-d54d-45f6-9389-4c8ab03d7024/chat",
    statusWebhookUrl: "https://xucre-n8n-05603adf5e11.herokuapp.com/webhook/325c20ab-02c0-4803-a3c2-e9bd81cb5d17",
  },
  {
    agentId: "data-steward",
    agentName: "Data Steward",
    agentDescription: "Keep your CRM data clean and organized",
    agentImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/data-steward-TMPHUcT93DijdGeXcQPIkwsngCsm6E.png",
    capabilities: [
      "Data cleaning",
      "Record deduplication",
      "Data enrichment",
      "Quality control",
      "Database management",
    ],
    webhookUrl: "https://xucre-n8n-05603adf5e11.herokuapp.com/webhook/f70c2816-fa37-4bba-9951-05e5fb8bd29c/chat",
    statusWebhookUrl: "https://xucre-n8n-05603adf5e11.herokuapp.com/webhook/1e181499-c5f1-4480-a458-a8fe6b3a55fb",
  },
]

export interface AgentSelectorProps {
  className?: string
  title?: string
  agents?: AgentContext[]
  initialAgentContext?: AgentContext | null
  onShowProfile?: (agent: AgentContext) => void
  onClose?: () => void
}

export function AgentSelector({
  className,
  title = "Select an Agent",
  agents = defaultAgents,
  initialAgentContext,
  onShowProfile,
  onClose,
}: AgentSelectorProps) {
  const { agentContext, setAgentContext, clearChat } = useChat()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Set initial agent if provided
  useEffect(() => {
    if (initialAgentContext && !agentContext) {
      setAgentContext(initialAgentContext)
      setSelectedAgentId(initialAgentContext.agentId)
    }
  }, [initialAgentContext, agentContext, setAgentContext])

  // Update selected agent when agentContext changes
  useEffect(() => {
    if (agentContext) {
      setSelectedAgentId(agentContext.agentId)
    }
  }, [agentContext])

  const handleAgentSelect = (agent: AgentContext) => {
    // If we're switching to a different agent, clear the chat first
    if (agentContext && agentContext.agentId !== agent.agentId) {
      clearChat()
    }

    // Set the new agent context
    setAgentContext(agent)
    setSelectedAgentId(agent.agentId)

    if (onShowProfile) {
      onShowProfile(agent)
    }
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.agentDescription.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardHeader className="py-0 pb-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="space-y-2">
          {filteredAgents.map((agent) => (
            <Button
              key={agent.agentId}
              variant={selectedAgentId === agent.agentId ? "default" : "outline"}
              className={cn(
                "w-full h-auto py-3 px-3 justify-start text-left flex-wrap",
                selectedAgentId === agent.agentId
                  ? "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white"
                  : "",
              )}
              onClick={() => handleAgentSelect(agent)}
            >
              <div className="flex items-center w-full">
                {agent.agentImage && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image
                      src={agent.agentImage || "/placeholder.svg"}
                      alt={agent.agentName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="font-medium text-sm">{agent.agentName}</span>
                  <span className="text-xs mt-1 opacity-80 break-words whitespace-normal">
                    {agent.agentDescription}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
