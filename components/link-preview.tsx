"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Globe } from "lucide-react"

interface LinkPreviewProps {
  url: string
  text: string
}

export function LinkPreview({ url, text }: LinkPreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [domain, setDomain] = useState("")

  useEffect(() => {
    try {
      const urlObj = new URL(url)
      setDomain(urlObj.hostname.replace("www.", ""))
    } catch (error) {
      console.error("Invalid URL:", url)
    }
  }, [url])

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block my-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
          <Globe className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {text}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-gray-500">{domain}</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      </div>
    </a>
  )
}
