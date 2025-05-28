# Ennube Chat

A customizable chat interface with AI agents for Next.js applications.

## Installation

\`\`\`bash
npm install ennube-chat
# or
yarn add ennube-chat
# or
pnpm add ennube-chat
\`\`\`

## Usage

\`\`\`jsx
import { EnnubeChat, type AgentContext } from 'ennube-chat'

// Define your agents
const agents: AgentContext[] = [
  {
    agentId: "customer-support",
    agentName: "Customer Support",
    agentDescription: "Help customers with product questions and issues",
    agentImage: "/customer-support.png",
    capabilities: ["Answer product questions", "Troubleshoot issues", "Process returns"],
    webhookUrl: "https://your-webhook-url.com/customer-support",
    statusWebhookUrl: "https://your-webhook-url.com/customer-support/status",
  },
  // Add more agents as needed
]

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat with our AI Assistants</h1>
      
      <EnnubeChat
        agents={agents}
        initialAgent={agents[0]}
        height="700px"
        width="100%"
        showHeader={true}
        showFooter={true}
        logoUrl="/your-logo.png"
        headerTitle="Your Company Name"
        inputPlaceholder="Ask our AI assistant..."
        onMessageSent={(message) => console.log("User sent:", message)}
        onMessageReceived={(message) => console.log("AI replied:", message)}
        onAgentSelected={(agent) => console.log("Selected agent:", agent.agentName)}
      />
    </div>
  )
}
\`\`\`

## Required API Routes

You need to add these API routes to your Next.js project:

### `/api/chat/route.ts`

\`\`\`tsx
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages, agent } = await req.json()

  // Create a system message based on the selected agent
  let systemMessage = "You are a helpful AI assistant."

  // Customize based on agent type
  if (agent) {
    systemMessage = `You are a ${agent} AI assistant.`
  }

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: systemMessage,
  })

  return result.toDataStreamResponse()
}
\`\`\`

### `/api/status-proxy/route.ts`

This route is needed if you're using asynchronous agents with status webhooks.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `agents` | `AgentContext[]` | Array of agent definitions |
| `initialAgent` | `AgentContext` | The initially selected agent |
| `showHeader` | `boolean` | Whether to show the header |
| `showFooter` | `boolean` | Whether to show the footer |
| `showAgentPanel` | `boolean` | Whether to show the agent selector panel |
| `className` | `string` | Custom CSS class for the container |
| `height` | `string` | Height of the chat container |
| `width` | `string` | Width of the chat container |
| `logoUrl` | `string` | Custom logo URL for the header |
| `headerTitle` | `string` | Custom title for the header |
| `inputPlaceholder` | `string` | Custom placeholder for the chat input |
| `onMessageSent` | `(message: string) => void` | Callback when a message is sent |
| `onMessageReceived` | `(message: string) => void` | Callback when a message is received |
| `onAgentSelected` | `(agent: AgentContext) => void` | Callback when an agent is selected |

## Types

### AgentContext

\`\`\`tsx
interface AgentContext {
  agentId: string;
  agentName: string;
  agentDescription: string;
  agentImage?: string;
  capabilities?: string[];
  webhookUrl?: string;
  statusWebhookUrl?: string;
}
\`\`\`

## Customization

You can customize the appearance of the chat interface by providing your own CSS or using the Tailwind classes.
\`\`\`

Let's create a simple example of how to use the library in a Next.js project:
