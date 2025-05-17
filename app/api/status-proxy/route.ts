import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { jobId, webhookUrl } = await req.json()

    if (!jobId || !webhookUrl) {
      return NextResponse.json({ error: "Missing required parameters: jobId and webhookUrl" }, { status: 400 })
    }

    console.log(`Proxying status request for jobId: ${jobId} to ${webhookUrl}`)

    // Set up timeout for webhook requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      // Construct URL with query parameters for GET request
      const url = new URL(webhookUrl)
      url.searchParams.append("jobId", jobId)

      // Log the full request details for debugging
      console.log("Status webhook request:", {
        url: url.toString(),
        method: "GET",
      })

      // Use GET instead of POST for status webhook
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Log the response status and headers for debugging
      console.log("Status webhook response status:", response.status)
      console.log("Status webhook response headers:", Object.fromEntries(response.headers.entries()))

      if (response.status === 404) {
        console.error(`Status webhook not found: ${webhookUrl}`)
        // Return a specific response for 404 errors
        return NextResponse.json(
          {
            status: "error",
            error: "Status webhook not found",
            fallback: true,
            output:
              "I couldn't check the status of your request because the status service is unavailable. The agent might still be working on your request.",
          },
          { status: 200 }, // Return 200 to the client so we can handle this gracefully
        )
      }

      if (!response.ok) {
        console.error(`Status webhook error: ${response.status}`)
        return NextResponse.json(
          {
            status: "error",
            error: `Status webhook returned ${response.status}`,
            fallback: true,
            output:
              "I'm having trouble checking the status of your request. The agent might still be working on your request, but I can't confirm that right now.",
          },
          { status: 200 }, // Return 200 to the client so we can handle this gracefully
        )
      }

      // Get the response as text first
      const responseText = await response.text()
      console.log("Raw webhook response:", responseText)

      // Check if the response is empty
      if (!responseText || responseText.trim() === "") {
        console.error("Empty response from webhook")
        return NextResponse.json(
          {
            status: "error",
            error: "Empty response from webhook",
            fallback: true,
            output: "The agent service returned an empty response. Please try again later.",
          },
          { status: 200 },
        )
      }

      try {
        // Try to parse as JSON
        const data = JSON.parse(responseText)

        // Add detailed logging of the response structure
        console.log("Response data type:", typeof data)
        if (Array.isArray(data)) {
          console.log("Response is an array with", data.length, "items")
          if (data.length > 0) {
            console.log("First item keys:", Object.keys(data[0]))
            if (data[0].Output) {
              console.log("Output type:", typeof data[0].Output)
              console.log("Output keys:", Object.keys(data[0].Output))
              console.log("Output.output type:", typeof data[0].Output.output)
            }
          }
        } else if (data && typeof data === "object") {
          console.log("Response object keys:", Object.keys(data))
        }

        // Just pass through the response as-is
        // The client-side code will handle the specific format
        return NextResponse.json(data)
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError, "Response text:", responseText)

        // Try to salvage the response if it looks like it might be JSON with some issues
        if (responseText.includes("{") && responseText.includes("}")) {
          console.log("Attempting to salvage malformed JSON")
          try {
            // Try to clean up common JSON issues
            const cleanedText = responseText
              .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
              .replace(/,\s*}/g, "}") // Remove trailing commas
              .replace(/,\s*]/g, "]") // Remove trailing commas in arrays

            const data = JSON.parse(cleanedText)
            console.log("Successfully salvaged JSON:", data)
            return NextResponse.json(data)
          } catch (e) {
            console.error("Failed to salvage JSON:", e)
          }
        }

        // If the response looks like it might be plain text (not JSON)
        if (!responseText.startsWith("{") && !responseText.startsWith("[")) {
          console.log("Response appears to be plain text, not JSON")
          return NextResponse.json({
            status: "completed",
            output: responseText,
          })
        }

        // If all else fails, return a fallback error response
        return NextResponse.json({
          status: "error",
          error: "Invalid JSON response from webhook",
          fallback: true,
          output: "The agent service returned an invalid response. Please try again later.",
        })
      }
    } catch (error) {
      console.error("Error fetching from webhook:", error)
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to fetch from webhook",
          details: error.message,
          fallback: true,
          output: "I'm having trouble connecting to the agent service. Please try again later.",
        },
        { status: 200 },
      ) // Return 200 to the client so we can handle this gracefully
    }
  } catch (error) {
    console.error("Error in status-proxy route:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
