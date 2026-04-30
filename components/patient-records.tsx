"use client"

import { useState, useMemo, useEffect } from "react"
import { usePatient, type Patient } from "@/lib/patient-context"
import { useAuth } from "@/lib/auth-context"
import { db } from "@/lib/firebase"
import { collectionGroup, query, where, getDocs, getDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Users,
  Calendar,
  User,
  Phone,
  FileText,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  Clock,
} from "lucide-react"

interface PatientRecordsProps {
  onBack: () => void
  onViewPatient: (patient: Patient) => void
}

type TimeFrame = "today" | "week" | "month" | "quarter" | "year" | "all"

export function PatientRecords({ onBack, onViewPatient }: PatientRecordsProps) {
  const { setCurrentPatient } = usePatient()
  const { hospital } = useAuth()

  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const fetchRecords = async () => {
      if (!hospital?.hospital_id) return;
      try {
        setIsLoading(true);
        const recordsQuery = query(
          collectionGroup(db, "medical_records"),
          where("hospital_id", "==", hospital.hospital_id)
        );
        const snapshot = await getDocs(recordsQuery);

        const patientMap = new Map<string, Patient>();

        for (const recordDoc of snapshot.docs) {
          const recordData = recordDoc.data() as any;
          const parentUserRef = recordDoc.ref.parent.parent;
          if (!parentUserRef) continue;

          let patient = patientMap.get(parentUserRef.id);
          if (!patient) {
            const userSnap = await getDoc(parentUserRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              // Calculate age
              let age: any = "N/A";
              if (userData.dob) {
                const birthDate = new Date(userData.dob);
                const today = new Date("2026-04-30");
                age = today.getFullYear() - birthDate.getFullYear();
              }

              patient = {
                id: userSnap.id,
                ...userData,
                fullName: userData.full_name || userData.fullName || "Unknown",
                name: userData.full_name || userData.fullName || "Unknown",
                swasthya_id: userData.swasthya_id || userData.swasthyaId,
                swasthyaId: userData.swasthya_id || userData.swasthyaId,
                phoneNumber: userData.phone || "N/A",
                phone: userData.phone || "N/A",
                bloodGroup: userData.blood_group || "N/A",
                address: userData.location || "N/A",
                age: age,
                gender: userData.gender || "N/A",
                medical_records: [],
                medicalHistory: []
              } as any;
              patientMap.set(parentUserRef.id, patient!);
            }
          }

          if (patient) {
            const rec = { id: recordDoc.id, ...recordData };
            patient.medical_records?.push(rec);
            patient.medicalHistory?.push(rec);
          }
        }

        setPatients(Array.from(patientMap.values()));
      } catch (err) {
        console.error("Failed to fetch patient records:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [hospital?.hospital_id]);

  // Get all visits (records) from all patients
  const allVisits = useMemo(() => {
    const visits: Array<{
      patient: Patient
      recordId: string
      date: string
      diagnosis: string
    }> = []

    patients.forEach((patient) => {
      patient.medicalHistory?.forEach((record) => {
        visits.push({
          patient,
          recordId: record.id,
          date: record.date || "",
          diagnosis: record.diagnosis || "",
        })
      })
    })

    return visits.sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
  }, [patients])

  // Filter visits based on time frame and search
  const filteredVisits = useMemo(() => {
    const now = new Date()
    let startFilter: Date | null = null
    let endFilter: Date | null = null

    // Calculate date range based on time frame
    switch (timeFrame) {
      case "today":
        startFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        break
      case "week":
        startFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        endFilter = now
        break
      case "month":
        startFilter = new Date(now.getFullYear(), now.getMonth(), 1)
        endFilter = now
        break
      case "quarter":
        startFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        endFilter = now
        break
      case "year":
        startFilter = new Date(now.getFullYear(), 0, 1)
        endFilter = now
        break
      case "all":
      default:
        // Use custom dates if provided
        if (startDate) startFilter = new Date(startDate)
        if (endDate) endFilter = new Date(endDate + "T23:59:59")
        break
    }

    return allVisits.filter((visit) => {
      const visitDate = new Date(visit.date)

      // Date filter
      if (startFilter && visitDate < startFilter) return false
      if (endFilter && visitDate > endFilter) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          (visit.patient.name?.toLowerCase().includes(query)) ||
          (visit.patient.phone?.includes(query)) ||
          (visit.patient.swasthyaId?.toLowerCase().includes(query)) ||
          (visit.diagnosis.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [allVisits, timeFrame, startDate, endDate, searchQuery])

  // Get unique patients from filtered visits
  const uniquePatients = useMemo(() => {
    const seen = new Set<string>()
    return filteredVisits.filter((visit) => {
      if (seen.has(visit.patient.id)) return false
      seen.add(visit.patient.id)
      return true
    })
  }, [filteredVisits])

  const handleViewPatient = (patient: Patient) => {
    setCurrentPatient(patient)
    onViewPatient(patient)
  }

  const timeFrameOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "Quarter" },
    { value: "year", label: "This Year" },
    { value: "all", label: "Custom" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <Users className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl lg:text-2xl text-primary-foreground mb-1">
                Patient Records
              </CardTitle>
              <p className="text-primary-foreground/80 text-sm lg:text-base">
                View and manage patient visit history
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-4 lg:p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, ID, or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-muted/30 border-border/50"
            />
          </div>

          {/* Time Frame Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Filter by Time Period</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {timeFrameOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={timeFrame === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFrame(option.value as TimeFrame)}
                  className="rounded-full px-4"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {timeFrame === "all" && (
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
              <Field>
                <FieldLabel htmlFor="start-date" className="text-sm">From Date</FieldLabel>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="end-date" className="text-sm">To Date</FieldLabel>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11"
                />
              </Field>
            </FieldGroup>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 lg:p-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Unique Patients</span>
              </div>
              <p className="text-3xl lg:text-4xl font-bold text-primary">{uniquePatients.length}</p>
            </div>
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl p-4 lg:p-6 border border-secondary/30">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <span className="text-sm text-muted-foreground">Total Visits</span>
              </div>
              <p className="text-3xl lg:text-4xl font-bold text-secondary">{filteredVisits.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Patient Visit History
        </h3>

        {isLoading ? (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium text-foreground mb-1">Loading Records...</p>
            </CardContent>
          </Card>
        ) : uniquePatients.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">No Records Found</p>
              <p className="text-muted-foreground">
                No patient records match your selected time frame
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {/* 
              // TODO: Import patient JSON and filter 
              // where patient.assigned_hospital_id === doctor.hospital_id 
              // Ensure this table strictly displays patients linked to the logged-in doctor.
            */}
            {uniquePatients.map((visit) => {
              const patientVisits = filteredVisits.filter(
                (v) => v.patient.id === visit.patient.id
              )
              const lastVisit = patientVisits[0]

              return (
                <Card
                  key={visit.patient.id}
                  className="border-border/50 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => handleViewPatient(visit.patient)}
                >
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <User className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-base lg:text-lg group-hover:text-primary transition-colors">
                            {visit.patient.name}
                          </h3>
                          <p className="text-xs lg:text-sm text-muted-foreground font-mono mt-0.5">
                            {visit.patient.swasthyaId}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" />
                              {visit.patient.phone}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground">
                              <FileText className="w-3.5 h-3.5" />
                              {patientVisits.length} visit{patientVisits.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>

                    {lastVisit && (
                      <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 font-medium">Last Visit</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              {new Date(lastVisit.date || "").toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="w-fit text-xs lg:text-sm px-3 py-1">
                          {lastVisit.diagnosis}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
