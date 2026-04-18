"use client"

import { useState } from "react"
import { usePatient } from "@/lib/patient-context"
import { AddRecordForm } from "@/components/add-record-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Phone,
  MapPin,
  Droplet,
  Calendar,
  Building2,
  Stethoscope,
  ClipboardList,
  Pill,
  Plus,
  FileText,
  Heart,
  Clock,
  Activity,
} from "lucide-react"

interface PatientDashboardProps {
  onBack: () => void
}

export function PatientDashboard({ onBack }: PatientDashboardProps) {
  const { currentPatient } = usePatient()
  const [showAddRecord, setShowAddRecord] = useState(false)

  if (!currentPatient) {
    return null
  }

  if (showAddRecord) {
    return <AddRecordForm onClose={() => setShowAddRecord(false)} onBack={onBack} />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 lg:py-8">
      {/* Patient Info Card */}
      <Card className="border-border/50 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 lg:w-12 lg:h-12 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-1">
                {currentPatient.name}
              </h2>
              <p className="text-primary-foreground/70 text-sm lg:text-base font-mono">
                {currentPatient.swasthyaId}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                  {currentPatient.age} years
                </Badge>
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                  {currentPatient.gender}
                </Badge>
                <Badge variant="secondary" className="bg-secondary/80 text-secondary-foreground border-0">
                  <Droplet className="w-3 h-3 mr-1" />
                  {currentPatient.bloodGroup}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="font-medium text-foreground">{currentPatient.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Blood Group</p>
                <p className="font-medium text-foreground">{currentPatient.bloodGroup}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-medium text-foreground truncate">{currentPatient.address}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
              {currentPatient.medicalHistory?.length || 0}
            </div>
            <div className="text-xs lg:text-sm text-muted-foreground">Total Records</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-secondary mb-1">
              {(currentPatient.medicalHistory?.length || 0) > 0
                ? new Date(currentPatient.medicalHistory?.[0]?.date || "").toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
                : "N/A"
              }
            </div>
            <div className="text-xs lg:text-sm text-gray-500 font-medium">Last Visit</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-accent mb-1">
              {currentPatient.age}
            </div>
            <div className="text-xs lg:text-sm text-muted-foreground">Age (Years)</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-primary/80 mb-1">
              {currentPatient.bloodGroup}
            </div>
            <div className="text-xs lg:text-sm text-muted-foreground">Blood Group</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Record Button */}
      <Button
  onClick={() => setShowAddRecord(true)}
  className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30 transition-all bg-green-600 hover:bg-green-700 text-white"
>
  <Plus className="mr-2 w-5 h-5" />
  Add New Medical Record
</Button>

      {/* Medical History */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg lg:text-xl flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-primary" />
              Medical History
            </CardTitle>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {currentPatient.medicalHistory?.length || 0} records
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 space-y-4">
          {(!currentPatient.medicalHistory || currentPatient.medicalHistory.length === 0) ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">No Medical Records</p>
              <p className="text-muted-foreground">
                Add a new record to start tracking medical history
              </p>
            </div>
          ) : (
            currentPatient.medicalHistory?.map((record, index) => (
              <Card
                key={record.id}
                className="border-border/50 bg-gradient-to-br from-muted/30 to-transparent hover:shadow-md transition-all"
              >
                <CardContent className="p-4 lg:p-6 space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">
                          {new Date(record.date || "").toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pl-10">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4" />
                          {record.hospitalName}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-4 h-4" />
                          {record.doctorName}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-accent text-accent-foreground w-fit text-sm px-3 py-1">
                      {record.diagnosis}
                    </Badge>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    {/* Symptoms */}
                    <div className="p-4 bg-background rounded-xl border border-border/50">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Symptoms
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">{record.symptoms}</p>
                    </div>

                    {/* Doctor Advice */}
                    <div className="p-4 bg-background rounded-xl border border-border/50">
                      <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5" />
                        Doctor&apos;s Advice
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">{record.doctorAdvice}</p>
                    </div>

                    {/* Vitals (if present) */}
                    {record.vitals && Object.keys(record.vitals).length > 0 && (
                      <div className="p-4 bg-background rounded-xl border border-border/50 lg:col-span-2">
                        <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" />
                          Vitals
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-foreground">
                          {record.vitals.bp && <div><span className="text-muted-foreground mr-1">BP:</span> {record.vitals.bp}</div>}
                          {record.vitals.heartRate && <div><span className="text-muted-foreground mr-1">HR:</span> {record.vitals.heartRate}</div>}
                          {record.vitals.spo2 && <div><span className="text-muted-foreground mr-1">SpO2:</span> {record.vitals.spo2}</div>}
                          {record.vitals.temperature && <div><span className="text-muted-foreground mr-1">Temp:</span> {record.vitals.temperature}</div>}
                          {record.vitals.weight && <div><span className="text-muted-foreground mr-1">Weight:</span> {record.vitals.weight}</div>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prescription */}
                  <div className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5" />
                      Prescription
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {record.prescription?.map((med, medIndex) => (
                        <div
                          key={medIndex}
                          className="flex flex-col gap-1 text-sm text-foreground bg-background/60 rounded-lg p-2.5 border border-border/40"
                        >
                          <div className="flex items-start gap-2 font-medium">
                            <ClipboardList className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                            <span>{med.medicineName}</span>
                          </div>
                          <div className="flex gap-2 text-xs text-muted-foreground pl-6">
                            <span>{med.timing}</span>
                            <span>•</span>
                            <span>{med.meal}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
