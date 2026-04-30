"use client"

import { useState, useEffect } from "react"
import { Calendar, Building2, Stethoscope, X, FileText, Pill, ClipboardList, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db, auth } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

// Removed hardcoded history
interface Consultation {
  id: string
  specialization: string
  date: string
  hospitalName: string
  diagnosis: string
  symptoms: string[]
  prescriptions: string[]
  notes: string
  followUp?: string
}

export function MedicalRecord() {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [records, setRecords] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const recordsRef = collection(db, "users", user.uid, "medical_records")
        // Try this temporarily:
        const q = query(recordsRef);

        unsubSnapshot = onSnapshot(q, (snapshot) => {
          const fetchedRecords = snapshot.docs.map(doc => {
            const data = doc.data()
            // Format date correctly
            let dateDisplay = "N/A"
            if (data.date) {
              try {
                const dateObj = data.date.toDate ? data.date.toDate() : new Date(data.date)
                dateDisplay = format(dateObj, "dd MMM yyyy")
              } catch (e) {
                dateDisplay = data.date
              }
            }

            return {
              id: doc.id,
              specialization: data.specialization || data.doctorType || "General Consultation",
              date: dateDisplay,
              hospitalName: data.hospitalName || data.location || "Private Clinic",
              diagnosis: data.diagnosis || "No specific diagnosis recorded",
              symptoms: Array.isArray(data.symptoms) ? data.symptoms : (Array.isArray(data.symptom) ? data.symptom : (data.symptoms || data.symptom ? [data.symptoms || data.symptom] : [])),
              prescriptions: Array.isArray(data.prescriptions) ? data.prescriptions : (Array.isArray(data.prescription) ? data.prescription : (data.prescriptions || data.prescription ? [data.prescriptions || data.prescription] : [])),
              notes: data.doctorNotes || data.notes || "No additional notes provided.",
              followUp: data.followUpDate ? (data.followUpDate.toDate ? format(data.followUpDate.toDate(), "dd MMM yyyy") : data.followUpDate) : undefined
            }
          })
          setRecords(fetchedRecords)
          setIsLoading(false)
        }, (err) => {
          console.error("Records fetch error:", err)
          setIsLoading(false)
        })
      } else {
        setRecords([])
        setIsLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubSnapshot) unsubSnapshot()
    }
  }, [])

  return (
    <div className="space-y-4">
      <Card className="border bg-card shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Stethoscope className="h-4 w-4 text-primary" />
            Consultation History
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="relative">
            {records.length > 0 && (
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            )}

            <div className="space-y-0">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
                      <Skeleton className="h-20 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              ) : records.length > 0 ? (
                records.map((consultation, index) => (
                  <button
                    key={consultation.id}
                    onClick={() => setSelectedConsultation(consultation)}
                    className="relative flex gap-3 pb-4 last:pb-0 w-full text-left group"
                  >
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${index === 0
                        ? "bg-primary border-primary"
                        : "bg-card border-border group-hover:border-primary/50"
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? "bg-primary-foreground" : "bg-muted-foreground"
                          }`} />
                      </div>
                    </div>

                    <div className={`flex-1 rounded-md border p-2.5 transition-all ${index === 0
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-border bg-card group-hover:border-primary/30 group-hover:bg-primary/5"
                      }`}>
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="h-3 w-3 text-primary" />
                          <span className="font-semibold text-foreground text-xs">
                            {consultation.specialization}
                          </span>
                        </div>
                        {index === 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-saffron text-saffron-foreground">
                            Latest
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{consultation.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{consultation.hospitalName}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="max-w-[200px] mx-auto">
                    <p className="text-xs font-medium text-foreground">No medical records found.</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Consult a SwasthyaLink verified doctor to begin your digital ledger.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Popup Modal */}
      {selectedConsultation && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
          onClick={() => setSelectedConsultation(null)}
        >
          <div
            className="bg-card rounded-lg shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-primary text-primary-foreground">
              <div>
                <h3 className="font-semibold text-sm">{selectedConsultation.specialization}</h3>
                <p className="text-[11px] text-primary-foreground/80">{selectedConsultation.date}</p>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="p-1.5 rounded-md hover:bg-primary-foreground/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 overflow-y-auto max-h-[calc(85vh-60px)] space-y-3">
              {/* Hospital */}
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Hospital</p>
                  <p className="text-xs text-foreground">{selectedConsultation.hospitalName}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Diagnosis</p>
                  <p className="text-xs text-foreground font-medium">{typeof selectedConsultation.diagnosis === 'object' && selectedConsultation.diagnosis !== null ? Object.values(selectedConsultation.diagnosis).join(', ') : String(selectedConsultation.diagnosis)}</p>
                </div>
              </div>

              {/* Symptoms */}
              <div className="flex items-start gap-2">
                <ClipboardList className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Symptoms</p>
                  <ul className="mt-1 space-y-0.5">
                    {selectedConsultation.symptoms?.map((symptom, idx) => (
                      <li key={idx} className="text-xs text-foreground flex items-start gap-1.5 mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                        <span>{typeof symptom === 'object' && symptom !== null ? Object.values(symptom).join(' - ') : String(symptom)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Prescriptions */}
              <div className="flex items-start gap-2">
                <Pill className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Prescriptions</p>
                  <ul className="mt-1 space-y-0.5">
                    {selectedConsultation.prescriptions?.map((prescription, idx) => (
                      <li key={idx} className="text-xs text-foreground flex items-start gap-1.5 mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                        <span>{typeof prescription === 'object' && prescription !== null ? Object.values(prescription).join(' - ') : String(prescription)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-muted/50 rounded-md p-2.5">
                <p className="text-[10px] text-muted-foreground uppercase font-medium mb-1">Doctor&apos;s Notes</p>
                <p className="text-xs text-foreground leading-relaxed">{typeof selectedConsultation.notes === 'object' && selectedConsultation.notes !== null ? Object.values(selectedConsultation.notes).join(', ') : String(selectedConsultation.notes)}</p>
              </div>

              {/* Follow-up */}
              {selectedConsultation.followUp && (
                <div className="bg-primary/10 rounded-md p-2.5 border border-primary/20">
                  <p className="text-[10px] text-primary uppercase font-medium mb-1">Follow-up Scheduled</p>
                  <p className="text-xs text-foreground font-medium">{selectedConsultation.followUp}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-border">
              <Button
                onClick={() => setSelectedConsultation(null)}
                className="w-full h-8 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
