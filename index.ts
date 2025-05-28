// Export the main component and types
export { EnnubeChat } from "./components/ennube-chat"
export type { EnnubeChatProps } from "./components/ennube-chat"
export type { AgentContext } from "./contexts/chat-context"

// Export utility components that might be useful for customization
export { ChatMessage } from "./components/chat-message"
export { AgentMiniProfile } from "./components/agent-mini-profile"
export { ThinkingAnimation } from "./components/thinking-animation"
export { AgentSelector } from "./components/agent-selector"
export { default as AgentProfile } from "./components/agent-profile"
export { ChatInterface } from "./components/chat-interface"
export { ChatProvider, useChat } from "./contexts/chat-context"

// Export UI components that might be needed
export { Button } from "./components/ui/button"
export { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./components/ui/card"
export { Badge } from "./components/ui/badge"
