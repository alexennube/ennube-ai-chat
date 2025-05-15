"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AgentContext } from "@/contexts/chat-context"

interface AgentMiniProfileProps {
  agent: AgentContext
  className?: string
  onClick?: () => void
}

export function AgentMiniProfile({ agent, className, onClick }: AgentMiniProfileProps) {
  return (
    <div
      className={cn(
        "flex items-start p-3 bg-gray-50 rounded-lg border border-gray-200",
        onClick && "cursor-pointer hover:bg-gray-100 transition-colors",
        className,
      )}
      onClick={onClick}
    >
      <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
        <Image src={agent.agentImage || "/placeholder.svg"} alt={agent.agentName} fill className="object-cover" />
      </div>
      <div className="ml-4 flex-1">
        <h3 className="font-medium text-lg">{agent.agentName}</h3>
        <p className="text-sm text-gray-600 mb-2">{agent.agentDescription}</p>

        {agent.capabilities && (
          <div className="flex flex-wrap gap-1.5">
            {agent.capabilities.slice(0, 3).map((capability, index) => (
              <Badge key={index} variant="outline" className="bg-gray-100 text-xs">
                {capability}
              </Badge>
            ))}
            {agent.capabilities.length > 3 && (
              <Badge variant="outline" className="bg-gray-100 text-xs">
                +{agent.capabilities.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
