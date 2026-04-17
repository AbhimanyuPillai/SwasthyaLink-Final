"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { PatientProvider } from "@/lib/patient-context"
import { LoginPage } from "@/components/login-page"
import { MainDashboard } from "@/components/main-dashboard"

function AppContent() {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return <LoginPage />
    }

    return (
        <PatientProvider>
            <MainDashboard />
        </PatientProvider>
    )
}

export default function Home() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}
