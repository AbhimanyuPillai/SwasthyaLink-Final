"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { ShieldCheck, Stethoscope, Lock, User } from "lucide-react"

export function LoginPage() {
  const { login } = useAuth()
  const [doctorId, setDoctorId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(doctorId, password)
      if (!success) {
        setError("Invalid credentials. Please try again.")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl border border-border/50">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 shadow-inner">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl lg:text-3xl font-bold text-foreground">
            Doctor Portal
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Sign in to access patient records
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 lg:px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="doctorId" className="text-sm font-medium">
                  Doctor ID
                </FieldLabel>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="doctorId"
                    type="text"
                    placeholder="Enter your Doctor ID"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    required
                    className="h-14 pl-12 text-base bg-muted/30 border-border/50 focus:bg-background transition-colors"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="text-sm font-medium">
                  Password
                </FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 pl-12 text-base bg-muted/30 border-border/50 focus:bg-background transition-colors"
                  />
                </div>
              </Field>
            </FieldGroup>

            {error && (
              <p className="text-sm text-destructive text-center bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Stethoscope className="mr-2 w-5 h-5" />
                  Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
