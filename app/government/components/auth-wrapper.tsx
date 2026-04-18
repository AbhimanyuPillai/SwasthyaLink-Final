"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/government/components/ui/button"
import { Input } from "@/app/government/components/ui/input"
import { Label } from "@/app/government/components/ui/label"
import Image from "next/image"

export function GovernmentAuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const auth = sessionStorage.getItem("gov_auth") === "true"
    if (auth) setIsAuthenticated(true)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (id === "gov" && password === "Pass@123") {
      sessionStorage.setItem("gov_auth", "true")
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Invalid credentials")
    }
  }

  if (!mounted) return null

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-saffron/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 mb-4 relative drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Image
              src="/swasthyalink-logo.png"
              alt="SwasthyaLink"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">Swasthya Drishti</h1>
          <p className="text-sm text-muted-foreground mt-3 text-center leading-relaxed">
            Authorized Personnel Only
            <br />
            Command Center Intelligence Access
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="id" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Official ID</Label>
            <Input
              id="id"
              type="text"
              placeholder="Enter your ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="bg-background/80 border-input h-11 transition-all focus:ring-2 focus:ring-emerald/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Security Passkey</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/80 border-input h-11 transition-all focus:ring-2 focus:ring-emerald/20"
            />
          </div>
          
          {error && <p className="text-destructive text-sm font-medium animate-in slide-in-from-top-1">{error}</p>}
          
          <Button type="submit" className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold mt-4 shadow-lg shadow-emerald/25 transition-all outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-emerald">
            Authenticate & Access
          </Button>
        </form>
      </div>
    </div>
  )
}
