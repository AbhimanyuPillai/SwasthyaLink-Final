"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface MedicalRecord {
  id: string
  date?: string
  hospitalName?: string
  doctorName?: string
  symptoms?: string
  diagnosis?: string
  doctorAdvice?: string
  prescription?: string[]
}

export interface Patient {
  id: string
  swasthyaId?: string
  name?: string
  phone?: string
  age?: number
  gender?: string
  bloodGroup?: string
  address?: string
  photoUrl?: string
  medicalHistory?: MedicalRecord[]
}

interface PatientContextType {
  currentPatient: Patient | null
  setCurrentPatient: (patient: Patient | null) => void
  patients: Patient[]
  addRecord: (patientId: string, record: Omit<MedicalRecord, "id">) => void
  findPatient: (query: string) => Patient | null
}

// Mock patient data
const mockPatients: Patient[] = [
  {
    id: "pat-001",
    swasthyaId: "SW-2024-001234",
    name: "Amit Sharma",
    phone: "9876543210",
    age: 35,
    gender: "Male",
    bloodGroup: "O+",
    address: "45 Green Park, Delhi - 110016",
    medicalHistory: [
      {
        id: "rec-001",
        date: "2024-01-15",
        hospitalName: "Apollo Hospital",
        doctorName: "Dr. Priya Mehta",
        symptoms: "Fever, headache, body pain",
        diagnosis: "Viral Fever",
        doctorAdvice: "Rest for 3 days, drink plenty of fluids, avoid cold food",
        prescription: ["Paracetamol 500mg - twice daily", "Cetirizine 10mg - once at night", "ORS packets - as needed"],
      },
      {
        id: "rec-002",
        date: "2024-03-20",
        hospitalName: "City General Hospital",
        doctorName: "Dr. Rajesh Kumar",
        symptoms: "Cough, cold, sore throat",
        diagnosis: "Upper Respiratory Tract Infection",
        doctorAdvice: "Warm water gargle, steam inhalation, avoid cold drinks",
        prescription: ["Azithromycin 500mg - once daily for 3 days", "Cough syrup - 10ml thrice daily", "Vitamin C tablets - once daily"],
      },
    ],
  },
  {
    id: "pat-002",
    swasthyaId: "SW-2024-005678",
    name: "Priya Patel",
    phone: "9123456789",
    age: 28,
    gender: "Female",
    bloodGroup: "A+",
    address: "78 Lake View Road, Mumbai - 400053",
    medicalHistory: [
      {
        id: "rec-003",
        date: "2024-02-10",
        hospitalName: "Fortis Hospital",
        doctorName: "Dr. Anita Singh",
        symptoms: "Stomach pain, nausea, loss of appetite",
        diagnosis: "Gastritis",
        doctorAdvice: "Avoid spicy food, eat small frequent meals, no smoking or alcohol",
        prescription: ["Pantoprazole 40mg - before breakfast", "Domperidone 10mg - before meals", "Antacid gel - as needed"],
      },
    ],
  },
  {
    id: "pat-003",
    swasthyaId: "SW-2024-009012",
    name: "Rahul Verma",
    phone: "9988776655",
    age: 45,
    gender: "Male",
    bloodGroup: "B+",
    address: "12 MG Road, Bangalore - 560001",
    medicalHistory: [],
  },
]

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export function PatientProvider({ children }: { children: ReactNode }) {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>(mockPatients)

  const findPatient = (query: string): Patient | null => {
    const normalizedQuery = query.toLowerCase().replace(/[\s-]/g, "")
    return patients.find(
      (p) =>
        (p.phone?.includes(normalizedQuery)) ||
        (p.swasthyaId?.toLowerCase().replace(/[\s-]/g, "").includes(normalizedQuery))
    ) || null
  }

  const addRecord = (patientId: string, record: Omit<MedicalRecord, "id">) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: `rec-${Date.now()}`,
    }
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, medicalHistory: [newRecord, ...(p.medicalHistory || [])] }
          : p
      )
    )
    if (currentPatient?.id === patientId) {
      setCurrentPatient((prev) =>
        prev ? { ...prev, medicalHistory: [newRecord, ...(prev.medicalHistory || [])] } : null
      )
    }
  }

  return (
    <PatientContext.Provider
      value={{ currentPatient, setCurrentPatient, patients, addRecord, findPatient }}
    >
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error("usePatient must be used within a PatientProvider")
  }
  return context
}
