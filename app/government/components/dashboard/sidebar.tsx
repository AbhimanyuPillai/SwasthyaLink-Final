"use client"

import Link from "next/link"
import Image from "next/image"
import { Activity, Map, Database, Brain, Menu, X, LogOut } from "lucide-react"
import { useState } from "react"
import { cn } from "@/app/government/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/government", icon: Activity },
  { label: "Live Heatmap", href: "/government/heatmap", icon: Map },
  { label: "Data Explorer", href: "/government/explorer", icon: Database },
  { label: "AI Intelligence", href: "/government/intelligence", icon: Brain },
]

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-[0.5rem] bg-navy text-sidebar-foreground"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-navy flex flex-col transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / Title */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <Image
                src="/swasthyalink-logo.png"
                alt="SwasthyaLink"
                width={44}
                height={44}
                className="h-10 w-10 object-contain brightness-0 invert opacity-95 drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground tracking-tight">
                Swasthya Drishti
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Command Center</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-[0.5rem] text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center gap-2 px-4 py-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-xs text-sidebar-foreground/60">System Online</span>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("gov_auth")
              window.location.reload()
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 rounded-[0.5rem] bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Secure Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
