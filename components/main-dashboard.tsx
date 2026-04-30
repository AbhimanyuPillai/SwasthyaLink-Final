"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProfilePopup } from "@/components/profile-popup"
import { PatientLookup } from "@/components/patient-lookup"
import { QRScanner } from "@/components/qr-scanner"
import { NewsReports } from "@/components/news-reports"
import { PatientRecords } from "@/components/patient-records"
import { PatientDashboard } from "@/components/patient-dashboard"
import { usePatient, Patient } from "@/lib/patient-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Keyboard, QrCode, Newspaper, Users, ArrowLeft, Building2, Activity } from "lucide-react"
import Image from "next/image"

type View = "dashboard" | "manual-entry" | "qr-scan" | "news" | "records" | "patient-detail"

// --- Helper: DOB to Age Calculation ---
const calculateAge = (dobString: string) => {
  if (!dobString) return "N/A"
  const birthDate = new Date(dobString)
  const today = new Date("2026-04-30") // Syncing with current project date
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function MainDashboard() {
  const { hospital } = useAuth()
  const { setCurrentPatient } = usePatient()
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [activePatient, setActivePatient] = useState<Patient | null>(null)

  const handleBack = () => {
    if (currentView === "patient-detail") {
      setActivePatient(null)
      setCurrentPatient(null)
    }
    setCurrentView("dashboard")
  }

  // --- Core Logic: Normalizing Firestore data for the UI ---
  const handlePatientFound = (patientData: any) => {
    if (!patientData) return

    // Normalization: Mapping Firestore snake_case to UI camelCase
    const normalizedPatient = {
      ...patientData,
      fullName: patientData.full_name || patientData.fullName,
      bloodGroup: patientData.blood_group || patientData.bloodGroup,
      phoneNumber: patientData.phone || patientData.phoneNumber,
      address: patientData.location || patientData.address,
      // Apply the Age logic
      age: patientData.dob ? calculateAge(patientData.dob) : "N/A",
      // Mapping body metrics
      weight: patientData.weight_kg || patientData.weight,
      height: patientData.height_cm || patientData.height,
    }

    // Update both local state and global context
    setActivePatient(normalizedPatient as Patient)
    setCurrentPatient(normalizedPatient as Patient)

    // Switch to the details view
    setCurrentView("patient-detail")
  }

  const handleViewPatientFromRecords = (patient: any) => {
    // Also apply normalization here to be safe
    handlePatientFound(patient)
  }

  const renderContent = () => {
    switch (currentView) {
      case "manual-entry":
        return <PatientLookup onPatientFound={handlePatientFound} onBack={handleBack} />
      case "qr-scan":
        return <QRScanner onPatientFound={handlePatientFound} onBack={handleBack} />
      case "news":
        return <NewsReports onBack={handleBack} />
      case "records":
        return <PatientRecords onBack={handleBack} onViewPatient={handleViewPatientFromRecords} />
      case "patient-detail":
        return activePatient ? (
          <PatientDashboard onBack={handleBack} />
        ) : (
          <MainGrid onNavigate={setCurrentView} />
        )
      default:
        return <MainGrid onNavigate={setCurrentView} />
    }
  }

  const getViewTitle = () => {
    switch (currentView) {
      case "manual-entry":
        return "Enter Patient Code"
      case "qr-scan":
        return "Scan QR Code"
      case "news":
        return "Healthcare News"
      case "records":
        return "Hospital Records"
      case "patient-detail":
        return "Patient Details"
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-[#004a99]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:gap-4">
              {currentView !== "dashboard" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="text-primary-foreground hover:bg-primary-foreground/10 -ml-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center overflow-hidden p-1">
                  <Image
                    src="/logo.png"
                    alt="Swasthya Sarathi Logo"
                    width={40}
                    height={40}
                    className="brightness-0 invert"
                  />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-primary-foreground tracking-tight">
                    Swasthya Sarathi
                  </h1>
                  {getViewTitle() && (
                    <p className="text-xs text-primary-foreground/70 hidden sm:block">
                      {getViewTitle()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <ProfilePopup />
          </div>

          {/* Hospital Info Bar */}
          {currentView === "dashboard" && (
            <div className="mt-4 pt-4 border-t border-primary-foreground/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-foreground/80" />
                </div>
                <div>
                  <p className="text-primary-foreground font-semibold text-sm lg:text-base">{hospital?.hospital_name}</p>
                  <p className="text-primary-foreground/70 text-xs lg:text-sm">{hospital?.full_name} • {hospital?.specialty}</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-secondary/20 rounded-full px-3 py-1.5">
                <Activity className="w-4 h-4 text-secondary" />
                <span className="text-xs text-primary-foreground font-medium">Online</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Footer - only on dashboard */}
      {currentView === "dashboard" && (
        <footer className="py-4 border-t border-border/50 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Swasthya Sarathi Healthcare Management System</span>
            <span className="hidden sm:inline">Secure | Reliable | Connected</span>
          </div>
        </footer>
      )}
    </div>
  )
}

function MainGrid({ onNavigate }: { onNavigate: (view: View) => void }) {
  const menuItems = [
    {
      id: "manual-entry",
      title: "Enter Code Manually",
      description: "Enter patient mobile number or Swasthya ID to access records",
      icon: Keyboard,
      gradient: "from-[#0f4c81] to-[#083a63]",
      iconBg: "bg-white/20",
    },
    {
      id: "qr-scan",
      title: "Scan QR Code",
      description: "Quick access by scanning patient health card QR code",
      icon: QrCode,
      gradient: "from-[#43a047] to-[#2e7d32]",
      iconBg: "bg-white/20",
    },
    {
      id: "news",
      title: "News Reports",
      description: "Stay updated with local healthcare news and alerts",
      icon: Newspaper,
      gradient: "from-[#fb8c00] to-[#e65100]",
      iconBg: "bg-white/20",
    },
    {
      id: "records",
      title: "Patient Records",
      description: "View complete hospital patient visit history and records",
      icon: Users,
      gradient: "from-[#455a64] to-[#263238]",
      iconBg: "bg-white/20",
    },
  ]

  return (
    <div className="py-4 lg:py-8">
      <div className="mb-8 lg:mb-12 text-center lg:text-left">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Welcome Back
        </h2>
        <p className="text-muted-foreground text-base lg:text-lg">
          Select an option below to get started with patient management
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {menuItems.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-border/50 overflow-hidden"
            onClick={() => onNavigate(item.id as View)}
          >
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${item.gradient} p-6 lg:p-8`}>
                <div
                  className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl ${item.iconBg} flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg lg:text-xl leading-tight">
                  {item.title}
                </h3>
              </div>
              <div className="p-4 lg:p-6 bg-card">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 lg:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 lg:p-6 text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">24</div>
            <div className="text-xs lg:text-sm text-muted-foreground">Today's Visits</div>
          </CardContent>
        </Card>
        {/* ... Other stats ... */}
      </div>
    </div>
  )
}