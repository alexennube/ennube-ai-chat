"use client"

import { EnnubeChat, type AgentContext } from "./index"

// Example custom agents
const customAgents: AgentContext[] = [
  {
    agentId: "custom-agent-1",
    agentName: "Customer Support",
    agentDescription: "Help customers with product questions and issues",
    agentImage: "/customer-support.png",
    capabilities: ["Answer product questions", "Troubleshoot issues", "Process returns", "Handle complaints"],
    webhookUrl: "https://your-webhook-url.com/customer-support",
    statusWebhookUrl: "https://your-webhook-url.com/customer-support/status",
  },
  {
    agentId: "custom-agent-2",
    agentName: "Sales Assistant",
    agentDescription: "Help customers find the right products and make purchases",
    agentImage: "/sales-assistant.png",
    capabilities: ["Product recommendations", "Answer pricing questions", "Explain product features", "Process orders"],
    webhookUrl: "https://your-webhook-url.com/sales-assistant",
    statusWebhookUrl: "https://your-webhook-url.com/sales-assistant/status",
  },
]

export default function ChatPage() {
  const handleMessageSent = (message: string) => {
    console.log("User sent message:", message)
  }

  const handleMessageReceived = (message: string) => {
    console.log("Received response:", message)
  }

  const handleAgentSelected = (agent: AgentContext) => {
    console.log("Selected agent:", agent.agentName)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with our AI Assistants</h1>

      <EnnubeChat
        agents={customAgents}
        initialAgent={customAgents[0]}
        height="700px"
        width="100%"
        showHeader={true}
        showFooter={true}
        logoUrl="/your-logo.png"
        headerTitle="Your Company Name"
        inputPlaceholder="Ask our AI assistant..."
        onMessageSent={handleMessageSent}
        onMessageReceived={handleMessageReceived}
        onAgentSelected={handleAgentSelected}
      />
    </div>
  )
}
