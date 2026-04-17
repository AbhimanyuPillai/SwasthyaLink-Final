"use client"

import { useState, useEffect } from "react"
import { MapPin, X, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

const MapPicker = dynamic(() => import("./map-picker"), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-muted/50 flex items-center justify-center text-muted-foreground text-xs">Loading map...</div> 
})

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (position: [number, number], address: string) => void
}

export function LocationModal({ isOpen, onClose, onSave }: LocationModalProps) {
  // Default to Pune: [18.5204, 73.8567]
  const [position, setPosition] = useState<[number, number]>([18.5204, 73.8567])
  const [address, setAddress] = useState<string>("Fetching location...")
  const [isLocating, setIsLocating] = useState(false)

  // Fetch address on position change using Nominatim
  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true
    const fetchAddress = async () => {
      setAddress("Updating location...")
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`)
        const data = await res.json()
        if (isMounted) {
          if (data && data.display_name) {
            const parts = data.display_name.split(', ')
            window.sessionStorage.setItem("swasthya-address", data.display_name)
            setAddress(parts.slice(0, 3).join(', '))
          } else {
            setAddress("Unknown Location")
          }
        }
      } catch (err) {
        if (isMounted) setAddress("Unable to fetch address")
      }
    }
    
    // debounce
    const timer = setTimeout(() => {
      fetchAddress()
    }, 500)
    
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [position, isOpen])

  // Function to auto-locate
  const handleAutoLocate = () => {
    if (navigator.geolocation) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude])
          setIsLocating(false)
        },
        (err) => {
          console.warn("Geolocation Error:", err)
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    }
  }

  // Auto locate on mount if available
  useEffect(() => {
    if (isOpen) {
      handleAutoLocate()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-[90%] max-w-md mx-auto bg-card rounded-lg shadow-xl border border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Confirm Your Location</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Map Area */}
        <div className="relative h-64 bg-muted/50 overflow-hidden w-full">
          <MapPicker position={position} setPosition={setPosition} />
          
          <button 
            onClick={handleAutoLocate}
            disabled={isLocating}
            className="absolute bottom-4 right-4 z-[400] bg-background text-foreground p-2 text-xs font-semibold rounded-md shadow-md border hover:bg-muted transition-all flex items-center gap-1"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-pulse text-primary' : 'text-foreground'}`} />
            {isLocating ? 'Locating...' : 'My Location'}
          </button>
        </div>

        {/* Location Display */}
        <div className="px-4 py-3 border-t border-border bg-card">
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Selected Location</p>
              <p className="text-xs font-medium text-foreground line-clamp-2">{address}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">[{position[0].toFixed(4)}, {position[1].toFixed(4)}]</p>
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={() => onSave(position, address)}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-xs py-2.5"
          >
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            Save Location
          </Button>
        </div>
      </div>
    </div>
  )
}
