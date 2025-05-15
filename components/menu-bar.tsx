"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useClickOutside } from "@/hooks/use-click-outside"
import {
  ChevronDown,
  LogOut,
  Home,
  PlusCircle,
  HelpCircle,
  Info,
  BookOpen,
  Search,
  User,
  CreditCard,
  UserCircle,
  Users,
  BarChart,
} from "lucide-react"

type MenuItem = {
  label: string
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
}

interface MenuBarProps {
  onViewAllAgents?: () => void
}

export function MenuBar({ onViewAllAgents }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({
    file: null,
    agents: null,
    history: null,
    help: null,
  })
  const [dropdownPositions, setDropdownPositions] = useState<Record<string, { left: number }>>({})
  const router = useRouter()
  const [user] = useState({ name: "Demo User", email: "user@example.com" })

  useClickOutside(menuRef, () => {
    setActiveMenu(null)
  })

  // Calculate dropdown positions when menu items are rendered
  useEffect(() => {
    const positions: Record<string, { left: number }> = {}

    Object.keys(menuButtonRefs.current).forEach((key) => {
      const buttonEl = menuButtonRefs.current[key]
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect()
        positions[key] = { left: rect.left }
      }
    })

    setDropdownPositions(positions)
  }, [])

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu)
  }

  const handleLogout = () => {
    // Handle logout logic here
    router.push("/login")
  }

  const handleViewAllAgents = () => {
    if (onViewAllAgents) {
      onViewAllAgents()
      setActiveMenu(null)
    }
  }

  const fileMenu: MenuItem[] = [
    { label: "New Chat", href: "/chat", icon: <PlusCircle className="h-4 w-4 mr-2" /> },
    { label: "Home", href: "https://app.ennube.ai", icon: <Home className="h-4 w-4 mr-2" /> },
    { label: "Dashboard", href: "https://app.ennube.ai/dashboard", icon: <BarChart className="h-4 w-4 mr-2" /> },
    { type: "separator" } as any,
    { label: "Profile", href: "/profile", icon: <UserCircle className="h-4 w-4 mr-2" /> },
    { label: "Account", href: "/account", icon: <User className="h-4 w-4 mr-2" /> },
    { label: "Billing", href: "/billing", icon: <CreditCard className="h-4 w-4 mr-2" /> },
    { label: "Logout", onClick: handleLogout, icon: <LogOut className="h-4 w-4 mr-2" /> },
  ]

  const agentsMenu: MenuItem[] = [
    { label: "Prospect Finder", href: "/chat?agent=prospect-finder" },
    { label: "Market Nurturer", href: "/chat?agent=market-nurturer" },
    { label: "Meetings Booker", href: "/chat?agent=meetings-booker" },
    { label: "Data Steward", href: "/chat?agent=data-steward" },
    { label: "View All Agents", onClick: handleViewAllAgents, icon: <Users className="h-4 w-4 mr-2" /> },
  ]

  const historyMenu: MenuItem[] = [
    { label: "Recent Conversations", href: "/chat/history" },
    { label: "Today", href: "/chat/history?period=today" },
    { label: "This Week", href: "/chat/history?period=week" },
    { label: "Search History", href: "/chat/history/search", icon: <Search className="h-4 w-4 mr-2" /> },
  ]

  const helpMenu: MenuItem[] = [
    { label: "Documentation", href: "/docs", icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { label: "Support", href: "/support", icon: <HelpCircle className="h-4 w-4 mr-2" /> },
    { label: "About Ennube.ai", href: "/about", icon: <Info className="h-4 w-4 mr-2" /> },
  ]

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item, index) => {
      if ((item as any).type === "separator") {
        return <li key={index} className="border-t border-gray-200 my-1"></li>
      }

      return (
        <li key={index} className="w-full">
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
              onClick={() => setActiveMenu(null)}
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <button
              className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
              onClick={() => {
                if (item.onClick) item.onClick()
                setActiveMenu(null)
              }}
            >
              {item.icon}
              {item.label}
            </button>
          )}
        </li>
      )
    })
  }

  return (
    <div ref={menuRef} className="bg-white border-b border-gray-200">
      <div className="flex items-center h-8 px-2">
        <div className="flex space-x-1">
          <button
            ref={(el) => (menuButtonRefs.current.file = el)}
            className={`px-3 py-1 text-sm hover:bg-gray-100 rounded ${activeMenu === "file" ? "bg-gray-100" : ""}`}
            onClick={() => toggleMenu("file")}
          >
            <span className="flex items-center">
              File <ChevronDown className="h-3 w-3 ml-1" />
            </span>
          </button>
          <button
            ref={(el) => (menuButtonRefs.current.agents = el)}
            className={`px-3 py-1 text-sm hover:bg-gray-100 rounded ${activeMenu === "agents" ? "bg-gray-100" : ""}`}
            onClick={() => toggleMenu("agents")}
          >
            <span className="flex items-center">
              Agents <ChevronDown className="h-3 w-3 ml-1" />
            </span>
          </button>
          <button
            ref={(el) => (menuButtonRefs.current.history = el)}
            className={`px-3 py-1 text-sm hover:bg-gray-100 rounded ${activeMenu === "history" ? "bg-gray-100" : ""}`}
            onClick={() => toggleMenu("history")}
          >
            <span className="flex items-center">
              History <ChevronDown className="h-3 w-3 ml-1" />
            </span>
          </button>
          <button
            ref={(el) => (menuButtonRefs.current.help = el)}
            className={`px-3 py-1 text-sm hover:bg-gray-100 rounded ${activeMenu === "help" ? "bg-gray-100" : ""}`}
            onClick={() => toggleMenu("help")}
          >
            <span className="flex items-center">
              Help <ChevronDown className="h-3 w-3 ml-1" />
            </span>
          </button>
        </div>
      </div>

      {/* Dropdown menus */}
      {activeMenu && (
        <div
          className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden"
          style={{
            left: menuButtonRefs.current[activeMenu]?.offsetLeft || 0,
          }}
        >
          {activeMenu === "file" && (
            <>
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <ul className="py-1">{renderMenuItems(fileMenu)}</ul>
            </>
          )}
          {activeMenu === "agents" && <ul className="py-1">{renderMenuItems(agentsMenu)}</ul>}
          {activeMenu === "history" && <ul className="py-1">{renderMenuItems(historyMenu)}</ul>}
          {activeMenu === "help" && <ul className="py-1">{renderMenuItems(helpMenu)}</ul>}
        </div>
      )}
    </div>
  )
}
