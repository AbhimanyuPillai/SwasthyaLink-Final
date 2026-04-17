"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import docData from "../app/doctor/doc_data.json"
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export interface DoctorProfile {
  hospital_id: string
  full_name: string
  hospital_name: string
  specialty: string
  phone: string
  area_zone: string
  google_maps_link: string
  operating_hours: string
}

interface AuthContextType {
  isAuthenticated: boolean
  hospital: DoctorProfile | null
  login: (doctorId: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hospital, setHospital] = useState<DoctorProfile | null>(null)

  useEffect(() => {
    // Check if user was previously logged in
    const stored = localStorage.getItem("swasthya-auth-hospital")
    if (stored) {
      try {
        const storedHospital = JSON.parse(stored)
        setIsAuthenticated(true)
        setHospital(storedHospital)
      } catch (e) {
        console.error("Failed to parse stored auth session")
      }
    }
  }, [])

  const login = async (doctorId: string, password: string): Promise<boolean> => {
    const cleanDoctorId = doctorId.trim()
    const cleanPassword = password.trim()

    if (cleanPassword !== "Pass@123") {
      return false
    }

    const matchedDoctor = docData.find((doc) => doc.hospital_id === cleanDoctorId)

    if (matchedDoctor) {
      setIsAuthenticated(true)
      setHospital(matchedDoctor)
      localStorage.setItem("swasthya-auth-hospital", JSON.stringify(matchedDoctor))
      return true
    }

    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setHospital(null)
    localStorage.removeItem("swasthya-auth-hospital")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, hospital, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
