"use client"

import { useState, useRef } from "react"
import { usePatient, type MedicalRecord } from "@/lib/patient-context"
import { addMedicalRecord } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Printer,
  X,
  Heart,
  Stethoscope,
  Pill,
  FileText,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"

interface AddRecordFormProps {
  onClose: () => void
  onBack: () => void
}

export function AddRecordForm({ onClose, onBack }: AddRecordFormProps) {
  const { currentPatient, addRecord } = usePatient()
  const { hospital } = useAuth()
  const printRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    doctorAdvice: "",
  })
  const [prescriptions, setPrescriptions] = useState<string[]>([""])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [savedRecord, setSavedRecord] = useState<MedicalRecord | null>(null)

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, ""])
  }

  const handleRemovePrescription = (index: number) => {
    if (prescriptions.length > 1) {
      setPrescriptions(prescriptions.filter((_, i) => i !== index))
    }
  }

  const handlePrescriptionChange = (index: number, value: string) => {
    const updated = [...prescriptions]
    updated[index] = value
    setPrescriptions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.symptoms || !formData.diagnosis || !formData.doctorAdvice) {
      setError("Please fill in all required fields")
      return
    }

    const validPrescriptions = prescriptions.filter((p) => p.trim() !== "")
    if (validPrescriptions.length === 0) {
      setError("Please add at least one prescription")
      return
    }

    setIsSubmitting(true)

    const newRecord: Omit<MedicalRecord, "id"> = {
      date: new Date().toISOString().split("T")[0],
      hospitalName: hospital?.hospital_name || "Unknown Hospital",
      doctorName: hospital?.full_name || "Unknown Doctor",
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      doctorAdvice: formData.doctorAdvice,
      prescription: validPrescriptions,
    }

    if (currentPatient) {
      try {
        const result: any = await addMedicalRecord(currentPatient.id, newRecord);
        const firestoreId = result?.id || "temp-id";

        // 3. Update local context for immediate UI feedback
        addRecord(currentPatient.id, newRecord)

        // 4. Update local state to show success view
        setSavedRecord({ ...newRecord, id: firestoreId });
      } catch (err) {
        console.error("Submission error:", err);
        setError("Failed to save the record to the remote database.");
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Prescription - ${currentPatient?.name}</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
                color: #1a365d;
              }
              .header {
                text-align: center;
                border-bottom: 3px solid #1a365d;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #1a365d;
                margin: 0;
                font-size: 28px;
              }
              .header p {
                color: #4a5568;
                margin: 5px 0;
              }
              .patient-info {
                background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 25px;
                border: 1px solid #e2e8f0;
              }
              .patient-info h2 {
                margin: 0 0 12px 0;
                font-size: 16px;
                color: #1a365d;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .patient-info p {
                margin: 6px 0;
                color: #4a5568;
              }
              .section {
                margin-bottom: 24px;
              }
              .section-title {
                font-weight: bold;
                color: #1a365d;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
                border-bottom: 2px solid #38a169;
                padding-bottom: 6px;
                display: inline-block;
              }
              .section-content {
                color: #2d3748;
                line-height: 1.7;
                padding: 12px;
                background: #f7fafc;
                border-radius: 8px;
                border-left: 4px solid #38a169;
              }
              .prescription-list {
                list-style: none;
                padding: 0;
                margin: 0;
              }
              .prescription-list li {
                padding: 12px 16px;
                background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
                border-radius: 8px;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                border: 1px solid #9ae6b4;
              }
              .pill-icon {
                width: 20px;
                height: 20px;
                background: #38a169;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
              }
              .footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 2px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
              }
              .signature {
                text-align: right;
              }
              .signature p {
                margin: 4px 0;
              }
              .signature .name {
                font-size: 18px;
                font-weight: bold;
                color: #1a365d;
              }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  if (savedRecord) {
    return (
      <div className="max-w-4xl mx-auto py-4 lg:py-8 space-y-6">
        {/* Success Header */}
        <Card className="border-border/50 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-secondary to-secondary/80 p-6 lg:p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary-foreground/20 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl lg:text-2xl text-secondary-foreground mb-1">
                  Record Saved Successfully
                </CardTitle>
                <p className="text-secondary-foreground/80">
                  Prescription is ready for printing
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-4 lg:p-6">
            {/* Printable Content - Hidden visually but used for print */}
            <div ref={printRef} className="hidden">
              <div className="header">
                <h1>{hospital?.hospital_name}</h1>
                <p>{hospital?.area_zone}</p>
                <p>Phone: {hospital?.phone} | Hours: {hospital?.operating_hours}</p>
                <p>ID: {hospital?.hospital_id}</p>
              </div>

              <div className="patient-info">
                <h2>Patient Information</h2>
                <p><strong>Name:</strong> {currentPatient?.name}</p>
                <p><strong>Swasthya ID:</strong> {currentPatient?.swasthyaId}</p>
                <p><strong>Age:</strong> {currentPatient?.age} years | <strong>Gender:</strong> {currentPatient?.gender} | <strong>Blood Group:</strong> {currentPatient?.bloodGroup}</p>
                <p><strong>Date:</strong> {savedRecord.date ? new Date(savedRecord.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}</p>
              </div>

              <div className="section">
                <div className="section-title">Symptoms</div>
                <div className="section-content">{savedRecord.symptoms || "N/A"}</div>
              </div>

              <div className="section">
                <div className="section-title">Diagnosis</div>
                <div className="section-content">{savedRecord.diagnosis || "N/A"}</div>
              </div>

              <div className="section">
                <div className="section-title">Doctor&apos;s Advice</div>
                <div className="section-content">{savedRecord.doctorAdvice || "N/A"}</div>
              </div>

              <div className="section">
                <div className="section-title">Prescription</div>
                <ul className="prescription-list">
                  {savedRecord.prescription?.map((med, index) => (
                    <li key={index}>
                      <span className="pill-icon">{index + 1}</span>
                      {med}
                    </li>
                  ))}
                  {(!savedRecord.prescription || savedRecord.prescription.length === 0) && (
                    <li className="text-muted-foreground italic">No prescriptions added</li>
                  )}
                </ul>
              </div>

              <div className="footer">
                <div>
                  <p><strong>Swasthya Sarathi</strong></p>
                  <p>Digital Healthcare System</p>
                </div>
                <div className="signature">
                  <p className="name">{hospital?.full_name}</p>
                  <p>{hospital?.specialty}</p>
                  <p>{hospital?.hospital_name}</p>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <Card className="border-border/50 bg-muted/20">
              <CardContent className="p-4 lg:p-6 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 bg-background rounded-xl border border-border/50">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                      Symptoms
                    </p>
                    <p className="text-sm text-foreground">{savedRecord.symptoms}</p>
                  </div>
                  <div className="p-4 bg-background rounded-xl border border-border/50">
                    <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">
                      Diagnosis
                    </p>
                    <p className="text-sm text-foreground font-medium">{savedRecord.diagnosis}</p>
                  </div>
                </div>

                <div className="p-4 bg-background rounded-xl border border-border/50">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                    Doctor&apos;s Advice
                  </p>
                  <p className="text-sm text-foreground">{savedRecord.doctorAdvice || "No advice provided"}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20">
                  <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">
                    Prescription ({(savedRecord.prescription?.length || 0)} items)
                  </p>
                  <div className="grid gap-2">
                    {savedRecord.prescription?.map((med, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-background/60 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                          {index + 1}
                        </div>
                        <span className="text-sm text-foreground">{med}</span>
                      </div>
                    ))}
                    {(!savedRecord.prescription || savedRecord.prescription.length === 0) && (
                      <p className="text-xs text-muted-foreground italic">No medicines listed</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                onClick={handlePrint}
                className="flex-1 h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Printer className="mr-2 w-5 h-5" />
                Print Prescription
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 h-14 text-base font-semibold rounded-xl"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Back to Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-4 lg:py-8">
      <Card className="border-border/50 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-secondary/80 p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary-foreground/20 flex items-center justify-center">
                <Plus className="w-7 h-7 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl lg:text-2xl text-secondary-foreground mb-1">
                  Add Medical Record
                </CardTitle>
                <p className="text-secondary-foreground/80 text-sm">
                  {currentPatient?.name} ({currentPatient?.swasthyaId})
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup className="gap-6">
              <Field>
                <FieldLabel htmlFor="symptoms" className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-primary" />
                  </div>
                  Symptoms
                </FieldLabel>
                <Textarea
                  id="symptoms"
                  placeholder="Describe the patient's symptoms in detail..."
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  required
                  rows={3}
                  className="mt-2 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="diagnosis" className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-accent" />
                  </div>
                  Diagnosed Disease
                </FieldLabel>
                <Input
                  id="diagnosis"
                  placeholder="Enter the diagnosis..."
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                  className="mt-2 h-12 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="advice" className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-secondary" />
                  </div>
                  Doctor&apos;s Advice
                </FieldLabel>
                <Textarea
                  id="advice"
                  placeholder="Enter advice and recommendations for the patient..."
                  value={formData.doctorAdvice}
                  onChange={(e) => setFormData({ ...formData, doctorAdvice: e.target.value })}
                  required
                  rows={3}
                  className="mt-2 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                />
              </Field>
            </FieldGroup>

            {/* Prescriptions */}
            <div className="p-4 lg:p-6 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20">
              <FieldLabel className="flex items-center gap-2 text-sm font-medium mb-4">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Pill className="w-4 h-4 text-secondary" />
                </div>
                Prescription
              </FieldLabel>
              <div className="space-y-3">
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="w-8 h-12 rounded-lg bg-secondary/20 flex items-center justify-center text-sm font-bold text-secondary flex-shrink-0">
                      {index + 1}
                    </div>
                    <Input
                      placeholder="Medicine name, dosage, frequency (e.g., Paracetamol 500mg - twice daily)"
                      value={prescription}
                      onChange={(e) => handlePrescriptionChange(index, e.target.value)}
                      className="h-12 bg-background border-border/50"
                    />
                    {prescriptions.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemovePrescription(index)}
                        className="flex-shrink-0 h-12 w-12 hover:bg-destructive/10 hover:border-destructive/50"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPrescription}
                className="mt-3 rounded-full"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Medicine
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-3 text-sm text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Saving Record...
                </>
              ) : (
                <>
                  <Save className="mr-2 w-5 h-5" />
                  Save and Generate Prescription
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
