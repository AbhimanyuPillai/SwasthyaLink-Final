"use client"

import { useState, useRef } from "react"
import { usePatient, type MedicalRecord, type PrescriptionItem, type Vitals } from "@/lib/patient-context"
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
  Activity,
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
  const [vitals, setVitals] = useState<Vitals>({ bp: "", spo2: "", heartRate: "", temperature: "", weight: "" })
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { medicineName: "", timing: "", meal: "Anytime" },
  ])
  const [activeTab, setActiveTab] = useState<"general" | "vitals" | "prescription">("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [savedRecord, setSavedRecord] = useState<MedicalRecord | null>(null)

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { medicineName: "", timing: "", meal: "Anytime" }])
  }

  const handleRemovePrescription = (index: number) => {
    if (prescriptions.length > 1) {
      setPrescriptions(prescriptions.filter((_, i) => i !== index))
    }
  }

  const handlePrescriptionChange = (index: number, field: keyof PrescriptionItem, value: string) => {
    const updated = [...prescriptions]
    updated[index] = { ...updated[index], [field]: value }
    setPrescriptions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.symptoms || !formData.diagnosis || !formData.doctorAdvice) {
      setError("Please fill in all required fields")
      return
    }

    const validPrescriptions = prescriptions.filter((p) => p.medicineName.trim() !== "")
    if (validPrescriptions.length === 0) {
      setError("Please add at least one prescription")
      return
    }

    setIsSubmitting(true)

    const newRecord: Omit<MedicalRecord, "id"> = {
      date: new Date().toISOString().split("T")[0],
      hospital_id: hospital?.hospital_id || "",
      hospitalName: hospital?.hospital_name || "Unknown Hospital",
      doctorName: hospital?.full_name || "Unknown Doctor",
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      doctorAdvice: formData.doctorAdvice,
      prescription: validPrescriptions,
      vitals,
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
              @page { size: A4; margin: 10mm; }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                color: #1a365d;
                background: white;
                font-size: 14px;
              }
              .header {
                text-align: center;
                border-bottom: 3px solid #1a365d;
                padding-bottom: 15px;
                margin-bottom: 20px;
              }
              .header h1 {
                color: #1a365d;
                margin: 0;
                font-size: 26px;
              }
              .header p {
                color: #4a5568;
                margin: 4px 0;
                font-size: 13px;
              }
              .patient-info {
                background: #f8fafc;
                padding: 15px;
                border: 1px solid #e2e8f0;
                margin-bottom: 20px;
              }
              .patient-info h2 {
                margin: 0 0 10px 0;
                font-size: 15px;
                color: #1a365d;
                border-bottom: 1px solid #cbd5e1;
                padding-bottom: 5px;
              }
              .patient-info p {
                margin: 5px 0;
                color: #334155;
              }
              .vitals-banner {
                background: #fef2f2;
                border: 1px solid #fecaca;
                padding: 10px 15px;
                border-radius: 6px;
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
              }
              .vitals-banner span {
                color: #991b1b;
                font-weight: 600;
                font-size: 13px;
              }
              .section {
                margin-bottom: 20px;
              }
              .section-title {
                font-weight: bold;
                color: #1a365d;
                font-size: 13px;
                text-transform: uppercase;
                margin-bottom: 8px;
                border-bottom: 2px solid #38a169;
                padding-bottom: 4px;
                display: inline-block;
              }
              .section-content {
                color: #334155;
                font-size: 14px;
              }
              table.prescription-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              table.prescription-table th, table.prescription-table td {
                border: 1px solid #cbd5e1;
                padding: 8px 12px;
                text-align: left;
                font-size: 13px;
              }
              table.prescription-table th {
                background: #f1f5f9;
                color: #1e293b;
                font-weight: 600;
              }
              .footer {
                margin-top: 40px;
                padding-top: 15px;
                border-top: 2px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
              }
              .signature {
                text-align: right;
              }
              .signature p { margin: 3px 0; font-size: 13px; }
              .signature .name { font-size: 16px; font-weight: bold; color: #1a365d; }
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <p><strong>Name:</strong> {currentPatient?.name}</p>
                  <p><strong>Swasthya ID:</strong> {currentPatient?.swasthyaId}</p>
                  <p><strong>Age/Gender:</strong> {currentPatient?.age} yr, {currentPatient?.gender}</p>
                  <p><strong>Date:</strong> {savedRecord.date ? new Date(savedRecord.date).toLocaleDateString("en-IN") : "N/A"}</p>
                </div>
              </div>

              {savedRecord.vitals && Object.keys(savedRecord.vitals).some(k => savedRecord.vitals![k as keyof Vitals]) && (
                <div className="vitals-banner">
                  {savedRecord.vitals.bp && <span>BP: {savedRecord.vitals.bp}</span>}
                  {savedRecord.vitals.spo2 && <span>SpO2: {savedRecord.vitals.spo2}</span>}
                  {savedRecord.vitals.heartRate && <span>Pulse: {savedRecord.vitals.heartRate}</span>}
                  {savedRecord.vitals.temperature && <span>Temp: {savedRecord.vitals.temperature}</span>}
                  {savedRecord.vitals.weight && <span>Weight: {savedRecord.vitals.weight}</span>}
                </div>
              )}

              <div className="section">
                <div className="section-title">Symptoms & Diagnosis</div>
                <div className="section-content"><strong>C/O:</strong> {savedRecord.symptoms || "N/A"}<br/><strong>Dx:</strong> {savedRecord.diagnosis || "N/A"}</div>
              </div>

              <div className="section">
                <div className="section-title">Doctor's Advice</div>
                <div className="section-content">{savedRecord.doctorAdvice || "N/A"}</div>
              </div>

              <div className="section">
                <div className="section-title">Prescription (Rx)</div>
                {(!savedRecord.prescription || savedRecord.prescription.length === 0) ? (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No medicines prescribed.</p>
                ) : (
                  <table className="prescription-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>Sr.</th>
                        <th>Medicine & Dosage</th>
                        <th>Timing</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedRecord.prescription.map((med, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{med.medicineName}</td>
                          <td>{med.timing}</td>
                          <td>{med.meal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
                        <span className="text-sm font-medium text-foreground w-1/2">{med.medicineName}</span>
                        <span className="text-xs text-muted-foreground">{med.timing} • {med.meal}</span>
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
          {/* Custom Tabs */}
          <div className="flex bg-muted/40 p-1 rounded-xl mb-6 border border-border/50">
            <button
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
                activeTab === "general" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={(e) => { e.preventDefault(); setActiveTab("general"); }}
            >
              General Details
            </button>
            <button
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
                activeTab === "vitals" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={(e) => { e.preventDefault(); setActiveTab("vitals"); }}
            >
              Vitals
            </button>
            <button
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
                activeTab === "prescription" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={(e) => { e.preventDefault(); setActiveTab("prescription"); }}
            >
              Prescriptions
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* General Tab */}
            {activeTab === "general" && (
              <FieldGroup className="gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
            )}

            {/* Vitals Tab */}
            {activeTab === "vitals" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 bg-muted/20 p-4 rounded-xl border border-border/50">
                <Field>
                  <FieldLabel className="text-sm font-medium text-muted-foreground">Blood Pressure (mmHg)</FieldLabel>
                  <Input placeholder="e.g. 120/80" value={vitals.bp} onChange={(e) => setVitals({...vitals, bp: e.target.value})} className="mt-1" />
                </Field>
                <Field>
                  <FieldLabel className="text-sm font-medium text-muted-foreground">Heart Rate (bpm)</FieldLabel>
                  <Input placeholder="e.g. 82" value={vitals.heartRate} onChange={(e) => setVitals({...vitals, heartRate: e.target.value})} className="mt-1" />
                </Field>
                <Field>
                  <FieldLabel className="text-sm font-medium text-muted-foreground">SpO2 (%)</FieldLabel>
                  <Input placeholder="e.g. 98" value={vitals.spo2} onChange={(e) => setVitals({...vitals, spo2: e.target.value})} className="mt-1" />
                </Field>
                <Field>
                  <FieldLabel className="text-sm font-medium text-muted-foreground">Temperature</FieldLabel>
                  <Input placeholder="e.g. 98.6°F" value={vitals.temperature} onChange={(e) => setVitals({...vitals, temperature: e.target.value})} className="mt-1" />
                </Field>
                <Field>
                  <FieldLabel className="text-sm font-medium text-muted-foreground">Weight (kg)</FieldLabel>
                  <Input placeholder="e.g. 75" value={vitals.weight} onChange={(e) => setVitals({...vitals, weight: e.target.value})} className="mt-1" />
                </Field>
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === "prescription" && (
            <div className="p-4 lg:p-6 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <FieldLabel className="flex items-center gap-2 text-sm font-medium mb-4">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Pill className="w-4 h-4 text-secondary" />
                </div>
                Prescriptions
              </FieldLabel>
              <div className="space-y-3">
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-background/50 p-2 rounded-lg border border-border/40">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-sm font-bold text-secondary flex-shrink-0 self-center sm:self-auto">
                      {index + 1}
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                      <Input
                        placeholder="Medicine & Dosage"
                        value={prescription.medicineName}
                        onChange={(e) => handlePrescriptionChange(index, "medicineName", e.target.value)}
                        className="bg-background border-border/50 text-sm h-10"
                      />
                    </div>
                    <div className="w-full sm:w-1/3">
                      <select 
                        value={prescription.timing}
                        onChange={(e) => handlePrescriptionChange(index, "timing", e.target.value)}
                        className="w-full h-10 bg-background border border-border/50 rounded-md px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                      >
                        <option value="">Timing...</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Night">Night</option>
                        <option value="Twice a day">Twice a day</option>
                        <option value="Thrice a day">Thrice a day</option>
                        <option value="As Needed">As Needed</option>
                        <option value="SOS">SOS (Emergency)</option>
                      </select>
                    </div>
                    <div className="w-full sm:w-1/4">
                      <select 
                        value={prescription.meal}
                        onChange={(e) => handlePrescriptionChange(index, "meal", e.target.value)}
                        className="w-full h-10 bg-background border border-border/50 rounded-md px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                      >
                        <option value="Anytime">Anytime</option>
                        <option value="Before Meal">Before Meal</option>
                        <option value="After Meal">After Meal</option>
                      </select>
                    </div>
                    {prescriptions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePrescription(index)}
                        className="flex-shrink-0 self-end sm:self-auto hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
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
                className="mt-4 rounded-full"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Medicine
              </Button>
            </div>
            )}

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
