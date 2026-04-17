"use client"

import { useState, useEffect } from "react"
import { Patient } from "@/lib/patient-context"
import { handlePatientLookup } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { QrCode, Camera, CheckCircle2, AlertCircle, Scan } from "lucide-react"

interface QRScannerProps {
  onPatientFound: (patient: Patient) => void
  onBack: () => void
}

export function QRScanner({ onPatientFound }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "found" | "error">("idle")
  const [scanProgress, setScanProgress] = useState(0)

  const startScanning = () => {
    setIsScanning(true)
    setScanStatus("scanning")
    setScanProgress(0)
  }

  // Simulate QR scanning
  useEffect(() => {
    if (!isScanning) return

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    const scanTimer = setTimeout(async () => {
      // Simulate reading a QR code string
      const simulatedDecodedString = "SW-2024-001234" // In real life, camera outputs this

      try {
        const patient = await handlePatientLookup(simulatedDecodedString)
        if (patient) {
          setScanStatus("found")
          setTimeout(() => {
            onPatientFound(patient)
          }, 1000)
        } else {
          setScanStatus("error")
          setIsScanning(false)
        }
      } catch (err) {
        setScanStatus("error")
        setIsScanning(false)
      }
    }, 2500)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(scanTimer)
    }
  }, [isScanning, onPatientFound])

  const resetScanner = () => {
    setIsScanning(false)
    setScanStatus("idle")
    setScanProgress(0)
  }

  return (
    <div className="max-w-xl mx-auto py-4 lg:py-8">
      <Card className="border-border/50 shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-secondary to-secondary/80 p-6 lg:p-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary-foreground/20 backdrop-blur-sm">
            <QrCode className="w-10 h-10 text-secondary-foreground" />
          </div>
          <CardTitle className="text-xl lg:text-2xl text-secondary-foreground mb-2">
            Scan QR Code
          </CardTitle>
          <CardDescription className="text-secondary-foreground/80">
            Point camera at patient health card
          </CardDescription>
        </div>

        <CardContent className="p-6 lg:p-8">
          {/* Scanner Area */}
          <div className="relative aspect-square max-w-sm mx-auto mb-6 rounded-2xl overflow-hidden bg-muted/50 border-2 border-dashed border-border">
            {/* Camera Preview Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              {scanStatus === "idle" && (
                <div className="text-center p-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-10 h-10 text-primary/50" />
                  </div>
                  <p className="text-muted-foreground">
                    Camera preview will appear here
                  </p>
                </div>
              )}

              {scanStatus === "scanning" && (
                <div className="absolute inset-0 bg-foreground/90">
                  {/* Simulated camera view */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-3/4 aspect-square">
                      {/* Scanning frame */}
                      <div className="absolute inset-0 border-4 border-primary rounded-2xl" />
                      
                      {/* Corner accents */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-secondary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-secondary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-secondary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-secondary rounded-br-lg" />

                      {/* Scanning line animation */}
                      <div 
                        className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent transition-all duration-100"
                        style={{ top: `${scanProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-background/20 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-secondary transition-all duration-100 rounded-full"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-secondary-foreground text-sm mt-3 font-medium">
                      Scanning... {scanProgress}%
                    </p>
                  </div>
                </div>
              )}

              {scanStatus === "found" && (
                <div className="text-center p-6 animate-in fade-in zoom-in duration-300">
                  <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-14 h-14 text-secondary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-1">
                    Patient Found!
                  </p>
                  <p className="text-muted-foreground">
                    Loading medical records...
                  </p>
                </div>
              )}

              {scanStatus === "error" && (
                <div className="text-center p-6">
                  <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-14 h-14 text-destructive" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-1">
                    Scan Failed
                  </p>
                  <p className="text-muted-foreground">
                    Could not read QR code. Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {scanStatus === "idle" && (
              <Button
                onClick={startScanning}
                className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all bg-secondary hover:bg-secondary/90"
              >
                <Scan className="mr-2 w-5 h-5" />
                Start Scanning
              </Button>
            )}

            {scanStatus === "scanning" && (
              <Button
                variant="outline"
                onClick={resetScanner}
                className="w-full h-14 text-base font-semibold rounded-xl"
              >
                <Spinner className="mr-2" />
                Cancel Scanning
              </Button>
            )}

            {scanStatus === "error" && (
              <Button
                onClick={startScanning}
                className="w-full h-14 text-base font-semibold rounded-xl bg-secondary hover:bg-secondary/90"
              >
                <Scan className="mr-2 w-5 h-5" />
                Try Again
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-sm font-medium text-foreground mb-4">Scanning Tips</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  1
                </div>
                <span>Ensure the QR code is within the scanning frame</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  2
                </div>
                <span>Hold steady and avoid shadows on the code</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  3
                </div>
                <span>Make sure the health card is clean and undamaged</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
