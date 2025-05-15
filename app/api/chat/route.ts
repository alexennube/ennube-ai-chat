import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, agent } = await req.json()

  // Create a system message based on the selected agent
  let systemMessage = "You are a helpful AI assistant."

  switch (agent) {
    case "data-steward":
      systemMessage =
        "You are a Data Steward AI assistant. You help with data management, governance, and quality control. You provide guidance on data organization, cleaning, and maintenance."
      break
    case "prospect-finder":
      systemMessage =
        "You are a Prospect Finder AI assistant. You help track down high-quality prospects for tech teams. You can find potential customers, qualify leads, and research companies."
      break
    case "meetings-booker":
      systemMessage =
        "You are a Meetings Booker AI assistant. You help schedule and organize meetings efficiently. You can suggest optimal meeting times, send invitations, and handle follow-ups."
      break
    case "market-nurturer":
      systemMessage =
        "You are a Market Nurturer AI assistant. You help with marketing strategies to nurture leads and grow market presence. You provide guidance on content creation, campaign planning, and audience engagement."
      break
  }

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: systemMessage,
  })

  return result.toDataStreamResponse()
}
