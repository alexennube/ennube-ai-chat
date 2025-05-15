"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AgentContext } from "@/contexts/chat-context"

interface AgentProfileProps {
  agent: AgentContext
  onBack: () => void
  onClearChat?: () => void
  onClose?: () => void
}

export default function AgentProfile({ agent, onBack, onClearChat, onClose }: AgentProfileProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">Agent Profile</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4">
          <Image src={agent.agentImage || "/placeholder.svg"} alt={agent.agentName} fill className="object-cover" />
        </div>
        <h3 className="text-xl font-bold text-center">{agent.agentName}</h3>
        <p className="text-sm text-center text-gray-600 mt-2 px-4">{agent.agentDescription}</p>
      </div>

      <div className="px-4">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">CAPABILITIES</h4>
        {agent.capabilities ? (
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((capability, index) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {capability}
              </Badge>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-purple-500 mr-3"></span>
              <span className="text-sm">Find potential customers</span>
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-purple-500 mr-3"></span>
              <span className="text-sm">Qualify leads</span>
            </li>
            <li className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-purple-500 mr-3"></span>
              <span className="text-sm">Research companies</span>
            </li>
          </ul>
        )}
      </div>

      {onClearChat && (
        <div className="mt-auto px-4 pb-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={onClearChat}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      )}
    </div>
  )
}
