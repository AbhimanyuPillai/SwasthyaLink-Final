"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, ImagePlus, AlertTriangle, X, MapPin, Phone, Clock, Navigation, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BACKEND_URL } from "@/lib/backend"

// ─── Session helpers ──────────────────────────────────────────────────────────

function patientPayloadFromSession() {
  if (typeof window === "undefined") return undefined
  try {
    const raw = sessionStorage.getItem("swasthya-user")
    if (!raw) return undefined
    const u = JSON.parse(raw) as Record<string, unknown>
    return {
      age: typeof u.age === "number" ? u.age : undefined,
      gender: typeof u.gender === "string" ? u.gender : undefined,
      weight_kg:
        typeof u.weight_kg === "number"
          ? u.weight_kg
          : typeof u.weight === "number"
            ? u.weight
            : undefined,
      height_cm:
        typeof u.height_cm === "number"
          ? u.height_cm
          : typeof u.height === "number"
            ? u.height
            : undefined,
      location: typeof u.location === "string" ? u.location : "Pune, Maharashtra",
      conditions: Array.isArray(u.conditions) ? (u.conditions as string[]) : [],
    }
  } catch {
    return undefined
  }
}

/** Returns the user's GPS coordinates from the location modal save, if available. */
function userCoordsFromSession(): { lat: number; lng: number } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem("swasthya-user")
    if (!raw) return null
    const u = JSON.parse(raw) as Record<string, unknown>
    // live_location is stored as [lat, lng] array by handleLocationSave in dashboard
    if (Array.isArray(u.live_location) && u.live_location.length === 2) {
      const [lat, lng] = u.live_location as [number, number]
      if (typeof lat === "number" && typeof lng === "number") {
        return { lat, lng }
      }
    }
    return null
  } catch {
    return null
  }
}

function userLocationFromSession(): string {
  if (typeof window === "undefined") return ""
  try {
    const raw = sessionStorage.getItem("swasthya-user")
    if (!raw) return ""
    const u = JSON.parse(raw) as Record<string, unknown>
    return typeof u.location === "string" ? u.location : ""
  } catch {
    return ""
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Hospital {
  hospital_id: string
  full_name: string
  hospital_name: string
  specialty: string
  phone: string
  area_zone: string
  google_maps_link: string
  operating_hours: string
  lat: number
  lng: number
  distance_km: number | null
}

interface ChatResponse {
  probable_ailment?: string
  care_points?: string
  recommended_specialist?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  image?: string
  chatData?: ChatResponse
  hospitals?: Hospital[]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <a
      href={hospital.google_maps_link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-background border border-border hover:border-primary/40 rounded-xl p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
          <Navigation className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-semibold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
              {hospital.hospital_name}
            </p>
            {hospital.distance_km !== null && (
              <span className="flex-shrink-0 text-[9px] font-semibold bg-primary/10 text-primary rounded-full px-1.5 py-0.5 ml-1">
                {hospital.distance_km < 1
                  ? `${Math.round(hospital.distance_km * 1000)} m`
                  : `${hospital.distance_km} km`}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
            {hospital.specialty}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{hospital.area_zone}</span>
            </span>
            {hospital.phone !== "OXO" && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Phone className="h-2.5 w-2.5 flex-shrink-0" />
                <span>{hospital.phone}</span>
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
              <Clock className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{hospital.operating_hours}</span>
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

/** Renders a rich response bubble for assistant messages */
function AssistantBubble({ message, isHydrated }: { message: Message; isHydrated: boolean }) {
  if (message.role !== "assistant") return null

  const hasStructuredData = message.chatData && (
    message.chatData.probable_ailment ||
    message.chatData.care_points ||
    message.chatData.recommended_specialist
  )

  return (
    <div className="bg-card text-foreground border border-border rounded-2xl rounded-tl-sm shadow-sm overflow-hidden max-w-[90%]">
      {hasStructuredData ? (
        <div>
          {/* Medical Assessment Section */}
          <div className="px-4 pt-3 pb-3 space-y-3">
            {message.chatData!.probable_ailment && message.chatData!.probable_ailment.toLowerCase() !== "pending" && (
              <div className="flex gap-2 items-start">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">
                  Probable Ailment
                </span>
                <span className="text-sm text-foreground font-medium leading-snug">{message.chatData!.probable_ailment}</span>
              </div>
            )}
            {message.chatData!.recommended_specialist && message.chatData!.recommended_specialist.toLowerCase() !== "pending" && (
              <div className="flex gap-2 items-start">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">
                  See a
                </span>
                <span className="text-sm font-medium text-foreground leading-snug">
                  {message.chatData!.recommended_specialist}
                </span>
              </div>
            )}
            {message.chatData!.care_points && (
              <div className="pt-1">
                {(message.chatData!.probable_ailment && message.chatData!.probable_ailment.toLowerCase() !== "pending") && (
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1.5">Analysis & Care Points</p>
                )}
                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line bg-muted/40 p-3 rounded-lg border border-border/50">
                  {message.chatData!.care_points}
                </div>
              </div>
            )}
          </div>

          {/* Hospital Recommendations Section */}
          {message.hospitals && message.hospitals.length > 0 && (
            <div className="border-t border-border bg-muted/30 px-3 pt-2.5 pb-3">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Nearby Recommended Hospitals
              </p>
              <div className="space-y-2">
                {message.hospitals.map((h) => (
                  <HospitalCard key={h.hospital_id} hospital={h} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="px-3 py-2">
          <p className="text-sm md:text-base whitespace-pre-line leading-relaxed">{message.content}</p>
        </div>
      )}

      {isHydrated && (
        <p className="text-[9px] text-muted-foreground px-3 pb-1.5">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AskAgent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize messages only on client side to avoid hydration mismatch
  useEffect(() => {
    const saved = sessionStorage.getItem("swasthya-mitra-chat")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Revive date objects
        const revived = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
        setMessages(revived)
      } catch (e) {
        setMessages([
          {
            id: "1",
            role: "assistant",
            content: "Namaste! I am Swasthya Mitra, your digital health assistant. You can describe your symptoms or ask any health-related questions. I will also suggest the most relevant nearby hospitals for you. How may I assist you today?",
            timestamp: new Date(),
          },
        ])
      }
    } else {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "Namaste! I am Swasthya Mitra, your digital health assistant. You can describe your symptoms or ask any health-related questions. I will also suggest the most relevant nearby hospitals for you. How may I assist you today?",
          timestamp: new Date(),
        },
      ])
    }
    setIsHydrated(true)
  }, [])

  // Save to session storage whenever messages change
  useEffect(() => {
    if (isHydrated && messages.length > 0) {
      sessionStorage.setItem("swasthya-mitra-chat", JSON.stringify(messages))
    }
  }, [messages, isHydrated])

  const clearChat = () => {
    const initial: Message[] = [
      {
        id: "1",
        role: "assistant",
        content: "Namaste! I am Swasthya Mitra, your digital health assistant. You can describe your symptoms or ask any health-related questions. I will also suggest the most relevant nearby hospitals for you. How may I assist you today?",
        timestamp: new Date(),
      },
    ]
    setMessages(initial)
    sessionStorage.setItem("swasthya-mitra-chat", JSON.stringify(initial))
  }

  // Show disclaimer on first visit to chat tab
  useEffect(() => {
    const hasSeenDisclaimer = sessionStorage.getItem("swasthya-mitra-disclaimer")
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true)
    }
  }, [])

  const handleDisclaimerAccept = () => {
    sessionStorage.setItem("swasthya-mitra-disclaimer", "true")
    setShowDisclaimer(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const fetchHospitalSuggestions = async (
    specialist: string,
    query: string,
    userLocation: string,
    coords: { lat: number; lng: number } | null
  ): Promise<Hospital[]> => {
    try {
      const res = await fetch("/api/hospital-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialist,
          query,
          userLocation,
          ...(coords ? { userLat: coords.lat, userLng: coords.lng } : {}),
        }),
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.suggestions ?? []
    } catch {
      return []
    }
  }

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isTyping) return

    const symptoms = input.trim()
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: symptoms || "Shared an image",
      timestamp: new Date(),
      image: selectedImage || undefined,
    }

    setMessages((prev: Message[]) => [...prev, userMessage])
    setInput("")
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsTyping(true)

    try {
      const patient = patientPayloadFromSession()
      const userLocation = userLocationFromSession()
      const coords = userCoordsFromSession()

      // 1. Call the main AI chat backend
      // Provide previous context (excluding large hospital arrays) to AI
      const history = messages.map(m => ({ 
        role: m.role, 
        content: m.content,
        ...(m.image ? { image: m.image } : {})
      }))
      
      const baseInstruction = `System Instruction:
1. ALWAYS consider the patient's full profile details (height, weight, pre-existing conditions like diabetes, BP, etc.) stored in the database.
2. EMERGENCY: If the symptoms combined with health history point to an emergency, immediately provide critical life-saving instructions and recommend emergency actions in 'care_points'. Do NOT ask follow-ups in this case.
3. FOLLOW-UPS: If it is NOT an emergency, FIRST ask a simple one-line follow-up question to gather necessary information before making a clear diagnosis. Do NOT include your internal analysis or generic advice when asking a follow-up. Just ask the question naturally.
4. FINAL DIAGNOSIS: After 2-3 questions, when you have good assurance about the diagnosis, provide a detailed analysis (explicitly stating factors like "Considering your weight of X kg..."), and a final diagnosis along with healthcare suggestions.
If you are constrained to return JSON with {probable_ailment, recommended_specialist, care_points}, put your one-line follow-up question (or your final detailed analysis) directly inside the 'care_points' string. For follow-ups, set probable_ailment and recommended_specialist exactly to "Pending".`

      const enrichedSymptoms = symptoms 
        ? `${baseInstruction}\n\nUser Input: ${symptoms}\n[If an image is provided, analyze it carefully for visual symptoms.]`
        : `${baseInstruction}\n\n[Analyze the provided image.]`

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: enrichedSymptoms,
          history,
          image: selectedImage || undefined,
          ...(patient ? { patient } : {}),
        }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      const data = await response.json() as ChatResponse | string

      let chatData: ChatResponse | undefined
      let displayText = ""

      if (typeof data === "object" && data !== null) {
        chatData = data as ChatResponse
        displayText = [
          chatData.probable_ailment ? `Probable Ailment: ${chatData.probable_ailment}` : "",
          chatData.recommended_specialist ? `Recommended Specialist: ${chatData.recommended_specialist}` : "",
          chatData.care_points ? `Care Points: ${chatData.care_points}` : "",
        ].filter(Boolean).join("\n")
      } else {
        displayText = String(data)
      }

      // 2. Fetch hospital suggestions using GPS coords + specialist keyword ONLY if not pending
      let hospitals: Hospital[] = []
      if (chatData?.recommended_specialist && chatData.recommended_specialist.toLowerCase() !== "pending") {
        hospitals = await fetchHospitalSuggestions(
          chatData.recommended_specialist,
          symptoms,
          userLocation,
          coords
        )
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: displayText,
        timestamp: new Date(),
        chatData,
        hospitals,
      }

      setMessages((prev: Message[]) => [...prev, assistantMessage])
    } catch {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't connect to the SwasthyaLink server. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev: Message[]) => [...prev, assistantMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-xl mx-4 max-w-sm w-full overflow-hidden">
            <div className="bg-accent/20 p-3 flex items-center gap-2 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-accent-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Important Disclaimer</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Swasthya Mitra is an <span className="font-medium text-foreground">AI-powered prediction software</span> that provides general health guidance and nearby hospital suggestions based on the symptoms you describe.
              </p>
              <div className="mt-3 p-2.5 bg-destructive/10 rounded-md border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  This is not a substitute for professional medical advice, diagnosis, or treatment. For proper consultation, please visit a qualified healthcare provider.
                </p>
              </div>
              <Button
                onClick={handleDisclaimerAccept}
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9"
              >
                I Understand
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Chat Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full border border-card" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-muted-foreground">AI Health Assistant • Hospital Finder • Online</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearChat}
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages - Full Width */}
      <div className="flex-1 overflow-y-auto py-3 px-4 bg-muted/20">
        <div className="space-y-3 w-full">
          {messages.map((message: Message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                  message.role === "user" ? "bg-accent" : "bg-primary"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-3 w-3 text-accent-foreground" />
                ) : (
                  <Bot className="h-3 w-3 text-primary-foreground" />
                )}
              </div>

              {message.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-primary text-primary-foreground rounded-tr-sm">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Uploaded"
                      className="max-w-full h-auto rounded-lg mb-2 max-h-32 object-cover"
                    />
                  )}
                  <p className="text-sm md:text-base whitespace-pre-line leading-relaxed">{message.content}</p>
                  {isHydrated && (
                    <p className="text-[9px] mt-1 text-primary-foreground/60">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              ) : (
                <AssistantBubble message={message} isHydrated={isHydrated} />
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-3 w-3 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card px-4 py-2.5">
        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img
              src={selectedImage}
              alt="Selected"
              className="h-16 w-auto rounded-lg border border-border object-cover"
            />
            <button
              onClick={removeSelectedImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Image Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 w-9 flex-shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ImagePlus className="h-4 w-4" />
          </Button>

          {/* Text Input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms to get AI advice + nearest hospitals..."
            rows={1}
            className="flex-1 resize-none rounded-full border border-border bg-muted/50 px-3.5 py-2 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all"
            style={{ minHeight: "36px", maxHeight: "72px" }}
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isTyping}
            size="icon"
            className="h-9 w-9 flex-shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-[9px] text-muted-foreground mt-2 text-center">
          AI predictions + hospital suggestions • Not a substitute for medical advice
        </p>
      </div>
    </div>
  )
}
