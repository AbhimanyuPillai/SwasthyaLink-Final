"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Vitals {
  bp?: string
  spo2?: string
  heartRate?: string
  temperature?: string
  weight?: string
}

export interface PrescriptionItem {
  medicineName: string
  timing: string
  meal: string
}

export interface MedicalRecord {
  id: string
  hospital_id?: string
  date?: string
  hospitalName?: string
  doctorName?: string
  symptoms?: string
  diagnosis?: string
  doctorAdvice?: string
  prescription?: PrescriptionItem[]
  vitals?: Vitals
}

export interface Patient {
  id: string
  swasthyaId?: string
  swasthya_id?: string
  name?: string
  fullName?: string
  phone?: string
  phoneNumber?: string
  age?: number | string
  gender?: string
  bloodGroup?: string
  address?: string
  photoUrl?: string
  medicalHistory?: MedicalRecord[]
  medical_records?: MedicalRecord[] | any[]
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
        prescription: [
          { medicineName: "Paracetamol 500mg", timing: "Twice a day", meal: "After Meal" },
          { medicineName: "Cetirizine 10mg", timing: "Once at night", meal: "After Meal" },
          { medicineName: "ORS packets", timing: "As Needed", meal: "Anytime" }
        ],
        vitals: { bp: "120/80 mmHg", spo2: "98%", heartRate: "82 bpm", temperature: "101.5°F", weight: "75 kg" }
      },
      {
        id: "rec-002",
        date: "2024-03-20",
        hospitalName: "City General Hospital",
        doctorName: "Dr. Rajesh Kumar",
        symptoms: "Cough, cold, sore throat",
        diagnosis: "Upper Respiratory Tract Infection",
        doctorAdvice: "Warm water gargle, steam inhalation, avoid cold drinks",
        prescription: [
          { medicineName: "Azithromycin 500mg", timing: "Once a day", meal: "After Meal" },
          { medicineName: "Cough syrup 10ml", timing: "Thrice a day", meal: "Anytime" },
          { medicineName: "Vitamin C", timing: "Once a day", meal: "After Meal" }
        ],
        vitals: { bp: "118/76 mmHg", spo2: "99%", temperature: "99.1°F" }
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
        prescription: [
          { medicineName: "Pantoprazole 40mg", timing: "Once a day", meal: "Before Meal" },
          { medicineName: "Domperidone 10mg", timing: "Twice a day", meal: "Before Meal" },
          { medicineName: "Antacid gel", timing: "As Needed", meal: "Anytime" }
        ],
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
          ? {
            ...p,
            medicalHistory: [newRecord, ...(p.medicalHistory || [])],
            medical_records: [newRecord, ...(p.medical_records || [])]
          }
          : p
      )
    )
    if (currentPatient?.id === patientId) {
      setCurrentPatient((prev) =>
        prev ? {
          ...prev,
          medicalHistory: [newRecord, ...(prev.medicalHistory || [])],
          medical_records: [newRecord, ...(prev.medical_records || [])]
        } : null
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
