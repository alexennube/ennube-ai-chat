"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export interface HeaderProps {
  logoUrl?: string
  title?: string
}

export default function Header({ logoUrl, title }: HeaderProps) {
  const [user, setUser] = useState({ name: "Demo User", email: "user@example.com" })

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex w-full items-center p-0 lg:px-0" aria-label="Global">
        <div className="flex px-3 py-2">
          <Link href="#" className="p-0">
            <span className="sr-only">{title || "Ennube.ai"}</span>
            <div className="flex items-center">
              <Image
                src={
                  logoUrl ||
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ennube%20AI%20Logo-vMn2YI2TEDti0VoVi98KpWl5Ufhr2k.png"
                }
                alt={`${title || "Ennube.ai"} logo`}
                width={36}
                height={36}
                className="h-9 w-auto"
              />
              <span className="ml-2 text-lg font-bold text-gray-900">{title || "Ennube.ai"}</span>
            </div>
          </Link>
        </div>
      </nav>
    </header>
  )
}
