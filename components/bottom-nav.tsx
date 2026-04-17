"use client"

import { FileText, MessageSquare, Newspaper, User } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "agent" | "news" | "records" | "profile"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const navItems: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "agent", label: "Mitra", icon: MessageSquare },
  { id: "news", label: "News", icon: Newspaper },
  { id: "records", label: "History", icon: FileText },
  { id: "profile", label: "Profile", icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
      <div className="flex items-center justify-around h-13 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-colors",
                isActive ? "text-accent" : "text-muted-foreground active:text-foreground"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-accent")} />
              <span className={cn("text-[10px] font-medium mt-0.5", isActive && "text-accent")}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-card" />
    </nav>
  )
}
