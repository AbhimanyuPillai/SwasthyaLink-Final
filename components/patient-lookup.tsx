"use client"

import { useState } from "react"
import { Patient } from "@/lib/patient-context"
import { handlePatientLookup } from "@/lib/firebase" // Now fetching from the subcollection!
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Search, Phone, CreditCard, AlertCircle, Keyboard } from "lucide-react"

interface PatientLookupProps {
  onPatientFound: (patient: Patient) => void
  onBack?: () => void // Made optional just in case you don't need a back button on the root search
}

export function PatientLookup({ onPatientFound }: PatientLookupProps) {
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSearching(true)

    try {
      const patient = await handlePatientLookup(query)
      if (patient) {
        // Boom! This patient object now automatically has their full medicalHistory attached
        onPatientFound(patient)
      } else {
        setError("Patient not found. Please check the ID or mobile number.")
      }
    } catch (err) {
      setError("An error occurred while fetching the patient. Please try again.")
      console.error(err)
    } finally {
      setIsSearching(false) // Cleaned up the duplicate state call here
    }
  }

  return (
    <div className="max-w-xl mx-auto py-4 lg:py-8">
      <Card className="border-border/50 shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 lg:p-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
            <Keyboard className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl lg:text-2xl text-primary-foreground mb-2">
            Enter Patient Code
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Search using mobile number or Swasthya ID
          </CardDescription>
        </div>

        <CardContent className="p-6 lg:p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="patient-code" className="text-sm font-medium">
                  Mobile Number or Swasthya ID
                </FieldLabel>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="patient-code"
                    type="text"
                    placeholder="e.g., 9876543210 or SW-2024-001234"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                    className="h-14 pl-12 text-base bg-muted/30 border-border/50 focus:bg-background transition-colors"
                  />
                </div>
              </Field>
            </FieldGroup>

            {error && (
              <div className="flex items-start gap-3 text-sm text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? (
                <>
                  <Spinner className="mr-2" />
                  Searching Records...
                </>
              ) : (
                <>
                  <Search className="mr-2 w-5 h-5" />
                  Find Patient
                </>
              )}
            </Button>
          </form>

          {/* Accepted Formats */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-sm font-medium text-foreground mb-4">Accepted Formats</p>
            <div className="grid gap-3">
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Mobile Number</p>
                  <p className="text-xs text-muted-foreground">10-digit number (e.g., 9876543210)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Swasthya ID</p>
                  <p className="text-xs text-muted-foreground">Format: SW-YYYY-XXXXXX</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}