"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { auth, db, storage } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { doc, setDoc, serverTimestamp, query, where, getDocs, collection, limit } from "firebase/firestore"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { Html5Qrcode } from "html5-qrcode"
import {
    IdCard,
    Smartphone,
    QrCode,
    User,
    Calendar,
    Droplets,
    Mail,
    Phone,
    AlertCircle,
    Ruler,
    Scale,
    CheckCircle2,
    ArrowRight,
    Shield,
    Heart,
    FileText,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// State variables will be inside the component

declare global {
    interface Window {
        recaptchaVerifier?: any
        confirmationResult?: ConfirmationResult
    }
}

type AuthMode = "login" | "register"
type LoginMethod = "swasthya-id" | "mobile" | "qr"
type AuthState = "initial" | "otp"

interface FormData {
    fullName: string
    dob: string
    gender: string
    bloodGroup: string
    email: string
    mobile: string
    emergencyContact: string
    height: string
    weight: string
    healthConcerns: string[]
}

const healthConcernOptions = [
    "Diabetes",
    "Hypertension (BP)",
    "Migraine",
    "Asthma",
    "Thyroid",
    "None",
]

export default function AuthPage() {
    const router = useRouter()
    const [authMode, setAuthMode] = useState<AuthMode>("login")
    const [loginMethod, setLoginMethod] = useState<LoginMethod>("swasthya-id")
    const [authState, setAuthState] = useState<AuthState>("initial")
    const [swasthyaId, setSwasthyaId] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("+91 ")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])

    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)

    const [formData, setFormData] = useState<FormData>({
        fullName: "", dob: "", gender: "", bloodGroup: "", email: "",
        mobile: "+91 ", emergencyContact: "+91 ", height: "", weight: "", healthConcerns: [],
    })
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
    const [profilePhotoPreviewUrl, setProfilePhotoPreviewUrl] = useState<string | null>(null)

    const otpRefs = [
        useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    ]

    const handleOtpChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            setAuthError(null)
            const newOtp = [...otp]
            newOtp[index] = value
            setOtp(newOtp)
            if (value && index < 5) {
                otpRefs[index + 1].current?.focus()
            }
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus()
        }
    }

    const handleHealthConcernToggle = (concern: string) => {
        if (concern === "None") {
            setFormData((prev) => ({
                ...prev,
                healthConcerns: prev.healthConcerns.includes("None") ? [] : ["None"],
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                healthConcerns: prev.healthConcerns.includes(concern)
                    ? prev.healthConcerns.filter((c) => c !== concern)
                    : [...prev.healthConcerns.filter((c) => c !== "None"), concern],
            }))
        }
    }

    const resetToInitial = () => {
        setAuthState("initial")
        setOtp(["", "", "", "", "", ""])
        setSwasthyaId("")
        setPhoneNumber("+91 ")
        setConfirmationResult(null)
        window.confirmationResult = undefined
        setAuthError(null)
    }

    const switchAuthMode = (mode: AuthMode) => {
        setAuthMode(mode)
        resetToInitial()
    }

    useEffect(() => {
        if (authState === "otp") {
            otpRefs[0].current?.focus()
        }
    }, [authState])

    // --- FIREBASE LOGIC ---
    const handleSendOtp = async (input?: string) => {
        let rawPhone = ""

        if (authMode === "register") {
            rawPhone = formData.mobile
        } else {
            if (loginMethod === "mobile") {
                rawPhone = phoneNumber
            } else if (loginMethod === "swasthya-id" || loginMethod === "qr") {
                rawPhone = input || swasthyaId
            }
        }

        if (!rawPhone || rawPhone.trim().length === 0) {
            setAuthError("Please provide a valid input.")
            return
        }

        setAuthError(null)
        setIsLoading(true)

        try {
            let phoneToUse = rawPhone

            if (authMode === "login") {
                let q
                if (loginMethod === "swasthya-id" || loginMethod === "qr") {
                    q = query(collection(db, "users"), where("swasthya_id", "==", rawPhone.trim()))
                } else {
                    // Sanitize for query as well
                    const cleanPhone = "+91 " + phoneNumber.replace(/\D/g, '').slice(-10);
                    q = query(collection(db, "users"), where("phone", "==", cleanPhone))
                }

                const querySnapshot = await getDocs(q)
                if (querySnapshot.empty) {
                    throw new Error(loginMethod === "swasthya-id"
                        ? "Swasthya ID not found. Please register first."
                        : "Mobile number is not registered. Please create an account.")
                }

                const userDoc = querySnapshot.docs[0].data()
                phoneToUse = userDoc.phone || userDoc.mobile_number || rawPhone
            }

            // Sanitization: Only digits
            const digitsOnly = phoneToUse.replace(/\D/g, '')
            if (digitsOnly.length < 10) {
                throw new Error("Phone number must have at least 10 digits.")
            }

            // Strictly format as +91 XXXXXXXXXX (last 10)
            const formattedPhone = `+91 ${digitsOnly.slice(-10)}`

            // 2. Setup Recaptcha
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear()
                    ; (window as any).recaptchaVerifier = undefined
            }

            const container = document.getElementById("recaptcha-container")
            if (container) container.innerHTML = ""

                ; (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" })

            // 3. Send OTP
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier)
            setConfirmationResult(confirmation)
            window.confirmationResult = confirmation
            setAuthState("otp")
            toast.success("OTP sent to " + formattedPhone)

        } catch (error: any) {
            console.error("Auth Logic Error:", error)
            const displayMessage = error.message || "Failed to process request."
            setAuthError(displayMessage)
            toast.error(displayMessage)
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear()
                    ; (window as any).recaptchaVerifier = undefined
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        const otpString = otp.join("")
        const confirmation = window.confirmationResult ?? confirmationResult
        if (otpString.length !== 6 || !confirmation) return

        setAuthError(null)
        setIsLoading(true)
        try {
            const credential = await confirmation.confirm(otpString)
            const firebaseUser = credential.user

            if (authMode === "register") {
                const calculatedAge = calculateAge(formData.dob)
                const conditions = formData.healthConcerns.filter((c) => c !== "None")

                let photoUrl: string | null = null
                if (profilePhoto) {
                    try {
                        const pref = storageRef(storage, `profile_photos/${firebaseUser.uid}`)
                        await uploadBytes(pref, profilePhoto)
                        photoUrl = await getDownloadURL(pref)
                    } catch (e) {
                        console.error("Profile photo upload failed:", e)
                    }
                }

                // 1. Swasthya ID Generation
                const currentYear = new Date().getFullYear();
                const randomDigits = Math.floor(1000 + Math.random() * 9000);
                const generatedSwasthyaId = `SW-${currentYear}-${randomDigits}`;

                const digits = (firebaseUser.phoneNumber ?? formData.mobile).replace(/\D/g, '').slice(-10)
                const formattedPhone = `+91 ${digits}`

                const userData = {
                    full_name: formData.fullName,
                    email: formData.email,
                    phone: formattedPhone,
                    blood_group: formData.bloodGroup,
                    dob: formData.dob,
                    gender: formData.gender,
                    emergency_contact: formData.emergencyContact,
                    height_cm: Number(formData.height) || 0,
                    weight_kg: Number(formData.weight) || 0,
                    conditions,
                    location: "Pune, Maharashtra",
                    photo_url: photoUrl,
                    swasthya_id: generatedSwasthyaId,
                    created_at: serverTimestamp(),
                }

                await setDoc(doc(db, "users", firebaseUser.uid), userData)

                const sessionUser = {
                    uid: firebaseUser.uid,
                    ...userData,
                    age: calculatedAge ?? undefined,
                }
                sessionStorage.setItem("swasthya-user", JSON.stringify(sessionUser))
                router.replace("/dashboard")
            } else {
                // Fetch existing user data on login
                // Use normalized format for query
                const digits = firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace(/\D/g, '').slice(-10) : ""
                const formattedForQuery = `+91 ${digits}`

                const q = query(collection(db, "users"), where("phone", "==", formattedForQuery), limit(1));
                const userDoc = await getDocs(q);

                if (!userDoc.empty) {
                    const data = userDoc.docs[0].data();
                    const sessionUser = {
                        uid: firebaseUser.uid,
                        full_name: data.full_name ?? data.name,
                        ...data,
                    }
                    sessionStorage.setItem("swasthya-user", JSON.stringify(sessionUser))
                } else {
                    // If for some reason Firestore doc is missing but auth succeeded
                    sessionStorage.setItem("swasthya-user", JSON.stringify({
                        uid: firebaseUser.uid,
                        phone: firebaseUser.phoneNumber
                    }))
                }
                router.replace("/dashboard")
            }
        } catch (error: any) {
            console.error("Verification Error:", error)
            setAuthError(error.code === 'auth/invalid-verification-code' ? "Incorrect OTP. Please try again." : "Verification failed.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Panel - Blurred Healthcare Background with Logo */}
            <div className="lg:w-1/2 relative flex items-center justify-center p-8 lg:p-12 min-h-[200px] lg:min-h-screen overflow-hidden">
                {/* Background image with blur */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url("/healthcare-bg.jpg")`,
                        filter: "blur(6px)",
                        transform: "scale(1.1)",
                    }}
                />
                {/* Dark overlay for better contrast */}
                <div className="absolute inset-0 bg-navy/70" />

                <div className="relative z-10 text-center">
                    <div className="inline-flex flex-col items-center gap-4">
                        {/* Logo image */}
                        <div className="w-28 h-28 lg:w-36 lg:h-36 bg-white rounded-2xl flex items-center justify-center shadow-lg p-3">
                            <img
                                src="/swasthyalink-logo.png"
                                alt="Swasthya Link Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Swasthya Link</h1>
                            {/* Saffron accent line */}
                            <div className="w-16 h-1 bg-saffron mx-auto mt-3 mb-3 rounded-full" />
                            <p className="text-sm lg:text-base text-white/80 tracking-wide">Your Digital Health Companion</p>
                        </div>
                    </div>

                    {/* Additional decorative elements for desktop */}
                    <div className="hidden lg:block mt-12 space-y-4 text-white/70 text-sm">
                        <div className="flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Secure & Encrypted</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Your Health, Connected</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Warm Beige Matching Reference */}
            <div className="lg:w-1/2 bg-[#f2f1ed] flex items-center justify-center p-4 lg:p-8 flex-1">
                <div className="w-full max-w-md">
                    <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden relative">

                        {/* FIREBASE RECAPTCHA */}
                        <div id="recaptcha-container"></div>

                        {authState === "initial" && authError && (
                            <div className="px-4 pt-3">
                                <p className="text-xs text-destructive text-center rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2">
                                    {authError}
                                </p>
                            </div>
                        )}

                        <div className="flex bg-[#f1f1f1] border-b border-border">
                            <button
                                type="button"
                                onClick={() => switchAuthMode("login")}
                                className={`flex-1 py-4 text-sm font-semibold transition-colors ${authMode === "login" ? "text-primary border-b-2 border-primary bg-white" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={() => switchAuthMode("register")}
                                className={`flex-1 py-4 text-sm font-semibold transition-colors ${authMode === "register" ? "text-primary border-b-2 border-primary bg-white" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Register
                            </button>
                        </div>

                        <div className="p-6">
                            {authState === "otp" ? (
                                <OtpVerification
                                    otp={otp}
                                    otpRefs={otpRefs}
                                    onOtpChange={handleOtpChange}
                                    onOtpKeyDown={handleOtpKeyDown}
                                    onVerify={handleVerifyOtp}
                                    onBack={resetToInitial}
                                    isRegistration={authMode === "register"}
                                    isLoading={isLoading}
                                    errorMessage={authState === "otp" ? authError : null}
                                />
                            ) : authMode === "login" ? (
                                <LoginForm
                                    loginMethod={loginMethod}
                                    setLoginMethod={setLoginMethod}
                                    swasthyaId={swasthyaId}
                                    setSwasthyaId={setSwasthyaId}
                                    phoneNumber={phoneNumber}
                                    setPhoneNumber={setPhoneNumber}
                                    onGetOtp={(input?: string) => handleSendOtp(input)}
                                    isLoading={isLoading}
                                />
                            ) : (
                                <RegisterForm
                                    formData={formData}
                                    setFormData={setFormData}
                                    healthConcernOptions={healthConcernOptions}
                                    onHealthConcernToggle={handleHealthConcernToggle}
                                    onSendOtp={() => handleSendOtp(formData.mobile)}
                                    isLoading={isLoading}
                                    profilePhoto={profilePhoto}
                                    setProfilePhoto={setProfilePhoto}
                                    profilePhotoPreviewUrl={profilePhotoPreviewUrl}
                                    setProfilePhotoPreviewUrl={setProfilePhotoPreviewUrl}
                                />
                            )}
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Your data is secure and encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

function LoginForm({
    loginMethod,
    setLoginMethod,
    swasthyaId,
    setSwasthyaId,
    phoneNumber,
    setPhoneNumber,
    onGetOtp,
    isLoading
}: any) {
    const [isCameraOpen, setIsCameraOpen] = useState(false)
    const [cameraError, setCameraError] = useState("")
    const qrReaderRef = useRef<Html5Qrcode | null>(null)

    // Centralized handler for successful QR detection
    const handleSuccessfulIdentification = async (decodedText: string) => {
        setSwasthyaId(decodedText)
        setCameraError("")

        // Trigger the OTP lookup logic using the decoded ID
        if (onGetOtp) {
            await onGetOtp(decodedText)
        }
    }

    const stopScanner = async () => {
        if (qrReaderRef.current && qrReaderRef.current.isScanning) {
            try {
                await qrReaderRef.current.stop()
                qrReaderRef.current.clear()
            } catch (e) {
                console.error("Stop error:", e)
            }
        }
        setIsCameraOpen(false)
    }

    const handleScanQrClick = async () => {
        if (isCameraOpen) {
            await stopScanner()
            return
        }

        setCameraError("")
        try {
            const qrReader = new Html5Qrcode("qr-reader")
            qrReaderRef.current = qrReader
            setIsCameraOpen(true)

            await qrReader.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText) => {
                    await stopScanner()
                    handleSuccessfulIdentification(decodedText)
                },
                (errorMessage) => { /* Ignore frame errors */ }
            )
        } catch (error) {
            setCameraError("Unable to access camera. Please check permissions.")
            console.error(error)
            setIsCameraOpen(false)
        }
    }

    // Effect to stop camera if user switches tabs (e.g., clicks "Mobile")
    useEffect(() => {
        if (loginMethod !== "qr") {
            stopScanner()
        }
    }, [loginMethod])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanner()
        }
    }, [])

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2">
                {[
                    { id: "swasthya-id", icon: IdCard, label: "Swasthya ID" },
                    { id: "mobile", icon: Smartphone, label: "Mobile" },
                    { id: "qr", icon: QrCode, label: "Scan QR" },
                ].map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setLoginMethod(id as any)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border transition-all ${loginMethod === id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{label}</span>
                    </button>
                ))}
            </div>

            {/* QR Login Method */}
            {loginMethod === "qr" ? (
                <div className="space-y-4">

                    <div className="aspect-square max-w-[250px] mx-auto border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center bg-muted/20 relative overflow-hidden shadow-inner">
                        <div id="qr-reader" className="w-full h-full"></div>
                        {!isCameraOpen && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                <QrCode className="w-12 h-12 text-muted-foreground mb-2 opacity-50" />
                                <p className="text-[10px] text-muted-foreground">Position your QR code within the frame</p>
                            </div>
                        )}
                    </div>

                    {/* Detected ID Display - Restored and prominent */}
                    {swasthyaId && (
                        <div className="max-w-[250px] mx-auto p-3 bg-primary/10 border border-primary/30 rounded-lg text-center animate-in fade-in zoom-in duration-300">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Detected ID</p>
                            <p className="text-sm font-mono font-bold text-primary">{swasthyaId}</p>
                        </div>
                    )}

                    {/* Full-width Camera Button */}
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleScanQrClick}
                        className={`w-full py-3 ${isCameraOpen ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'} font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm`}
                    >
                        <Smartphone className="w-4 h-4" />
                        {isCameraOpen ? "Stop Camera" : "Open Camera"}
                    </button>

                    {cameraError && (
                        <p className="text-[11px] text-destructive text-center font-medium bg-destructive/5 py-2 px-2 rounded-lg border border-destructive/10">
                            {cameraError}
                        </p>
                    )}
                </div>
            ) : (
                /* Manual ID / Mobile Login Method */
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {loginMethod === "swasthya-id" ? "Enter your Swasthya ID" : "Enter your Mobile Number"}
                        </label>
                        <div className="relative">
                            <input
                                type={loginMethod === "mobile" ? "tel" : "text"}
                                value={loginMethod === "mobile" ? phoneNumber : swasthyaId}
                                onChange={(e) => {
                                    if (loginMethod === "mobile") {
                                        let val = e.target.value;
                                        if (!val.startsWith("+91 ")) {
                                            val = "+91 " + val.replace(/^\+?9?1?\s?/, "");
                                        }
                                        setPhoneNumber(val);
                                    } else {
                                        setSwasthyaId(e.target.value);
                                    }
                                }}
                                placeholder={loginMethod === "mobile" ? "XXXXXXXXXX" : "SW-YYYY-XXXX"}
                                className="w-full px-4 py-3 border border-border rounded-lg bg-[#f9fafb] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
                            />
                            {loginMethod === "mobile" ? (
                                <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            ) : (
                                <IdCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => onGetOtp()}
                        disabled={(loginMethod === "mobile" ? !phoneNumber : !swasthyaId) || isLoading}
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? "Validating..." : "Get OTP"}
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>
            )}
        </div>
    )
}

// Helper function to calculate age from DOB
function calculateAge(dob: string): number | null {
    if (!dob) return null
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    return age >= 0 ? age : null
}

function RegisterForm({ formData, setFormData, healthConcernOptions, onHealthConcernToggle, onSendOtp, isLoading, profilePhoto, setProfilePhoto, profilePhotoPreviewUrl, setProfilePhotoPreviewUrl }: any) {
    const updateField = (field: keyof FormData, value: string) => {
        let finalValue = value;
        if (field === "mobile" || field === "emergencyContact") {
            if (!value.startsWith("+91 ")) {
                finalValue = "+91 " + value.replace(/^\+?9?1?\s?/, "");
            }
        }
        setFormData((prev: any) => ({ ...prev, [field]: finalValue }))
    }

    // Auto-calculate age from DOB
    const calculatedAge = useMemo(() => calculateAge(formData.dob), [formData.dob])

    return (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <User className="w-4 h-4" /> Profile Photo
                </div>
                
                <label className="relative cursor-pointer group block">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setProfilePhoto(file)
                            if (profilePhotoPreviewUrl) URL.revokeObjectURL(profilePhotoPreviewUrl)
                            setProfilePhotoPreviewUrl(file ? URL.createObjectURL(file) : null)
                        }}
                    />
                    <div className="flex items-center gap-4 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                        <div className="w-20 h-24 rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 group-hover:border-primary/50 transition-colors">
                            {profilePhotoPreviewUrl ? (
                                <img src={profilePhotoPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center">
                                    <User className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Upload</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            {!profilePhoto ? (
                                <>
                                    <p className="text-sm font-semibold text-foreground">Click to upload photo</p>
                                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                        JPG, PNG or WEBP. This will appear on your Swasthya Card.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-bold text-green-600 flex items-center gap-1.5 line-clamp-1">
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {profilePhoto.name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Click again if you wish to change the photo.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </label>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <User className="w-4 h-4" /> Personal Information
                </div>
                <div className="grid gap-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                        <input type="text" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="Enter your full name" className="w-full px-3 py-2.5 border border-border rounded-lg bg-[#f9fafb] text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5"><Calendar className="w-3 h-3 inline mr-1" />Date of Birth</label>
                        <input type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg bg-[#f9fafb] text-sm" />
                        {calculatedAge !== null && (
                            <p className="text-xs text-muted-foreground mt-1.5">Age: {calculatedAge} years</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Gender</label>
                            <select value={formData.gender} onChange={(e) => updateField("gender", e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg bg-[#f9fafb] text-sm">
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5"><Droplets className="w-3 h-3 inline mr-1" />Blood Group</label>
                            <select value={formData.bloodGroup} onChange={(e) => updateField("bloodGroup", e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg bg-[#f9fafb] text-sm">
                                <option value="">Select</option>
                                <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                                <option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Phone className="w-4 h-4" /> Contact Information
                </div>
                <div className="grid gap-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5"><Mail className="w-3 h-3 inline mr-1" />Email Address</label>
                        <input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="your@email.com" className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mobile Number</label>
                        <input type="tel" value={formData.mobile} onChange={(e) => updateField("mobile", e.target.value)} placeholder="XXXXX XXXXX" className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5"><AlertCircle className="w-3 h-3 inline mr-1" />Emergency Contact Number</label>
                        <input type="tel" value={formData.emergencyContact} onChange={(e) => updateField("emergencyContact", e.target.value)} placeholder="XXXXX XXXXX" className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-sm" />
                    </div>
                </div>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <Heart className="w-4 h-4" /> Health & Vitals
                </div>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5"><Ruler className="w-3 h-3 inline mr-1" />Height (cm)</label>
                            <input type="number" value={formData.height} onChange={(e) => updateField("height", e.target.value)} placeholder="170" className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5"><Scale className="w-3 h-3 inline mr-1" />Weight (kg)</label>
                            <input type="number" value={formData.weight} onChange={(e) => updateField("weight", e.target.value)} placeholder="65" className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Major Health Concerns</label>
                        <div className="grid grid-cols-2 gap-2">
                            {healthConcernOptions.map((concern: string) => (
                                <div
                                    key={concern}
                                    role="checkbox"
                                    aria-checked={formData.healthConcerns.includes(concern)}
                                    tabIndex={0}
                                    onClick={() => onHealthConcernToggle(concern)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault()
                                            onHealthConcernToggle(concern)
                                        }
                                    }}
                                    className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-all text-sm select-none ${formData.healthConcerns.includes(concern) ? "border-primary bg-primary/5 text-primary" : "border-input hover:border-primary/50"}`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${formData.healthConcerns.includes(concern) ? "bg-primary border-primary" : "border-input"}`}>
                                        {formData.healthConcerns.includes(concern) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                                    </div>
                                    <span className="text-xs">{concern}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onSendOtp}
                disabled={!formData.fullName || !formData.mobile || isLoading}
                className="w-full py-3 bg-success text-success-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isLoading ? "Sending..." : "Send OTP"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
        </div>
    )
}

function OtpVerification({
    otp,
    otpRefs,
    onOtpChange,
    onOtpKeyDown,
    onVerify,
    onBack,
    isRegistration,
    isLoading,
    errorMessage,
}: any) {
    return (
        <div className="space-y-6 text-center">
            <div>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">OTP Verification</h3>
                <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your mobile</p>
            </div>

            {errorMessage && (
                <p className="text-xs text-destructive rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 mx-auto max-w-sm">
                    {errorMessage}
                </p>
            )}

            <div className="flex justify-center gap-2">
                {otp.map((digit: string, index: number) => (
                    <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => onOtpChange(index, e.target.value)}
                        onKeyDown={(e) => onOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold border-2 border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
                    />
                ))}
            </div>

            <div className="space-y-3">
                <button
                    type="button"
                    onClick={onVerify}
                    disabled={otp.some((d: string) => !d) || isLoading}
                    className="w-full py-3 bg-success text-success-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? "Verifying..." : (isRegistration ? "Verify & Register" : "Verify & Login")}
                    {!isLoading && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <button type="button" onClick={onBack} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Back
                </button>
            </div>
        </div>
    )
}

