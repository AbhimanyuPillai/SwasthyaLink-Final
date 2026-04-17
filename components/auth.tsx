"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // The Bouncer checking Firebase for a valid session
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        // Bouncer kicks them back to the login page!
        router.push("/")
      }
      setLoading(false)
    })

    // Cleanup the listener when the component unmounts
    return () => unsubscribe()
  }, [router])

  // Show a blank screen or a spinner while the bouncer is checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">SL</span>
          </div>
          <p className="text-sm text-muted-foreground">Verifying secure session...</p>
        </div>
      </div>
    )
  }

  // If they pass the check, render the dashboard (children)
  return isAuthenticated ? <>{children}</> : null
}