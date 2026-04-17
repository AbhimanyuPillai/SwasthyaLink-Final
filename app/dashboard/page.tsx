"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Activity, FileText, MessageSquare, Newspaper, User, Menu, X, MapPin, LogOut } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { MedicalRecord } from "@/components/medical-record"
import { AskAgent } from "@/components/ask-agent"
import { LocalNews } from "@/components/local-news"
import { Profile } from "@/components/profile"
import { LocationModal } from "@/components/location-modal"
import { cn } from "@/lib/utils"
import { resolveAssetUrl } from "@/lib/backend"
import { db, auth } from "@/lib/firebase"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { doc, updateDoc, getDoc, onSnapshot } from "firebase/firestore"
import { toast } from "sonner"

type Tab = "agent" | "news" | "records" | "profile"

const tabTitles: Record<Tab, string> = {
    agent: "Swasthya Mitra",
    news: "Local News",
    records: "Medical History",
    profile: "Profile",
}

const sidebarItems: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "agent", label: "Swasthya Mitra", icon: MessageSquare },
    { id: "news", label: "Local News", icon: Newspaper },
    { id: "records", label: "Medical History", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
]

export default function SwasthyaLinkDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("agent")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [locationModalOpen, setLocationModalOpen] = useState(false)
    const [userAvatar, setUserAvatar] = useState<string>("")
    const [userName, setUserName] = useState<string>("Loading...")
    const [userIdDisplay, setUserIdDisplay] = useState<string>("")
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const router = useRouter()

    // Open location modal on first mount (simulating new session)
    useEffect(() => {
        const hasSetLocation = sessionStorage.getItem("swasthya-location-set")
        if (!hasSetLocation) {
            setLocationModalOpen(true)
        }
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Setup listener for real-time dashboard updates
                const docRef = doc(db, "users", user.uid)
                const unsubSnapshot = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const freshData = docSnap.data()
                        setUserName(freshData.full_name ?? freshData.name ?? "User")

                        const avatarUrl = resolveAssetUrl(freshData.photo_url)
                        if (avatarUrl) {
                            setUserAvatar(avatarUrl)
                        } else {
                            setUserAvatar("")
                        }

                        if (freshData.swasthya_id) {
                            setUserIdDisplay(freshData.swasthya_id)
                        } else {
                            setUserIdDisplay(`SL-${user.uid.slice(0, 8).toUpperCase()}`)
                        }
                    }
                })
                return () => unsubSnapshot()
            } else {
                // --- THIS IS THE CHANGE ---
                setUserName("")
                setUserAvatar("")
                setUserIdDisplay("")
                router.push("/login") // This forces the redirect on logout
                // --------------------------
            }
        })

        return () => unsubscribe()
    }, [router]) // Added router to the dependency array

    const handleLocationSave = async (position: [number, number], address: string) => {
        sessionStorage.setItem("swasthya-location-set", "true")

        try {
            const raw = sessionStorage.getItem("swasthya-user")
            if (raw) {
                const storedUser = JSON.parse(raw)
                if (storedUser.uid) {
                    await updateDoc(doc(db, "users", storedUser.uid), {
                        live_location: position,
                        location: address
                    })

                    storedUser.location = address
                    storedUser.live_location = position
                    sessionStorage.setItem("swasthya-user", JSON.stringify(storedUser))
                }
            }
        } catch (e) {
            console.error("Failed to update location in database", e)
        }

        setLocationModalOpen(false)
    }

    const openLocationModal = () => {
        setLocationModalOpen(true)
    }

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)

            // 1. Firebase Sign Out
            await signOut(auth)

            // 2. Session/Local Storage Cleanup
            sessionStorage.clear()
            localStorage.removeItem("swasthya-user")
            localStorage.removeItem("swasthya-location-set")

            toast.success("Logged out successfully")

            // 3. Programmatic Redirect
            router.push("/login")
        } catch (error) {
            console.error("Logout error:", error)
            toast.error("Failed to logout. Please try again.")
            setIsLoggingOut(false)
        }
    }

    const renderContent = () => {
        switch (activeTab) {
            case "agent":
                return <AskAgent />
            case "news":
                return <LocalNews />
            case "records":
                return <MedicalRecord />
            case "profile":
                return <Profile onChangeLocation={openLocationModal} onUpdate={() => {
                    // Re-trigger the mount useEffect's logic by re-reading from session storage
                    const raw = sessionStorage.getItem("swasthya-user")
                    const storedUser = raw ? JSON.parse(raw) : null
                    if (storedUser) {
                        setUserName(storedUser.full_name ?? storedUser.name ?? "User")
                        const avatarUrl = resolveAssetUrl(storedUser.photo_url)
                        if (avatarUrl) setUserAvatar(avatarUrl)
                    }
                }} />
            default:
                return <AskAgent />
        }
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Location Modal */}
            <LocationModal
                isOpen={locationModalOpen}
                onClose={() => setLocationModalOpen(false)}
                onSave={handleLocationSave}
            />

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
                {/* Clickable Logo - navigates to Swasthya Mitra */}
                <button
                    onClick={() => setActiveTab("agent")}
                    className="p-3 border-b border-sidebar-border hover:bg-sidebar-accent transition-colors text-left"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center">
                            <Activity className="h-4 w-4 text-sidebar-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground">Swasthya Link</h1>
                            <p className="text-[10px] text-sidebar-foreground/70">Health Portal</p>
                        </div>
                    </div>
                </button>

                <nav className="flex-1 p-2">
                    <ul className="space-y-0.5">
                        {sidebarItems.map((item) => {
                            const isActive = activeTab === item.id
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveTab(item.id)}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")} />
                                        {item.label}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Clickable Profile Card - navigates to Profile tab */}
                <button
                    onClick={() => setActiveTab("profile")}
                    className="p-3 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors text-left"
                >
                    <div className="flex items-center gap-2">
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt="User avatar"
                                className="w-7 h-7 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center">
                                <User className="h-4 w-4 text-sidebar-accent-foreground" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{userName}</p>
                            <p className="text-[10px] text-sidebar-foreground/60 truncate">{userIdDisplay}</p>
                        </div>
                    </div>
                </button>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-foreground/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-56 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 lg:hidden",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-3 border-b border-sidebar-border flex items-center justify-between">
                    <button
                        onClick={() => {
                            setActiveTab("agent")
                            setSidebarOpen(false)
                        }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 rounded-md bg-sidebar-accent flex items-center justify-center">
                            <Activity className="h-4 w-4 text-sidebar-accent-foreground" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold">Swasthya Link</h1>
                            <p className="text-[10px] text-sidebar-foreground/70">Health Portal</p>
                        </div>
                    </button>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <nav className="flex-1 p-2">
                    <ul className="space-y-0.5">
                        {sidebarItems.map((item) => {
                            const isActive = activeTab === item.id
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            setActiveTab(item.id)
                                            setSidebarOpen(false)
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4", isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")} />
                                        {item.label}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Clickable Profile Card in Mobile Sidebar */}
                <button
                    onClick={() => {
                        setActiveTab("profile")
                        setSidebarOpen(false)
                    }}
                    className="p-3 border-t border-sidebar-border hover:bg-sidebar-accent transition-colors text-left w-full"
                >
                    <div className="flex items-center gap-2">
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt="User avatar"
                                className="w-7 h-7 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center">
                                <User className="h-4 w-4 text-sidebar-accent-foreground" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{userName}</p>
                            <p className="text-[10px] text-sidebar-foreground/60 truncate">{userIdDisplay}</p>
                        </div>
                    </div>
                </button>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-56">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
                    <div className="flex items-center justify-between px-3 py-2.5 lg:px-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors lg:hidden"
                            >
                                <Menu className="h-4 w-4" />
                            </button>
                            {/* Clickable Logo in Header (mobile) */}
                            <button
                                onClick={() => setActiveTab("agent")}
                                className="flex items-center gap-2 lg:hidden"
                            >
                                <div className="w-7 h-7 rounded-md bg-primary-foreground/20 flex items-center justify-center">
                                    <Activity className="h-3.5 w-3.5" />
                                </div>
                                <div className="text-left">
                                    <h1 className="text-sm font-bold tracking-tight">Swasthya Link</h1>
                                    <p className="text-[10px] text-primary-foreground/80">Government Health Portal</p>
                                </div>
                            </button>
                            <div className="hidden lg:block">
                                <h1 className="text-base font-semibold">{tabTitles[activeTab]}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 pr-2 border-r border-primary-foreground/20">
                                <img
                                    src="/swasthyalink-logo.png"
                                    alt="Swasthya Link Logo"
                                    className="h-6 w-auto brightness-0 invert"
                                />
                                <span className="hidden sm:inline font-bold text-xs tracking-tight uppercase">Swasthya Link</span>
                            </div>

                            <button
                                className={cn(
                                    "p-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors flex items-center gap-1.5 text-xs text-white",
                                    isLoggingOut && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline font-medium">
                                    {isLoggingOut ? "Logging out..." : "Logout"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {activeTab !== "agent" && (
                        <div className="px-3 pb-2 lg:hidden">
                            <h2 className="text-base font-semibold">{tabTitles[activeTab]}</h2>
                        </div>
                    )}
                </header>

                {/* Main Content */}
                <main
                    className={cn(
                        activeTab === "agent"
                            ? "h-[calc(100vh-48px-52px)] lg:h-[calc(100vh-48px)]"
                            : "max-w-3xl mx-auto px-3 pt-4 pb-16 lg:px-4 lg:pb-6"
                    )}
                >
                    {renderContent()}
                </main>

                <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
        </div>
    )
}
