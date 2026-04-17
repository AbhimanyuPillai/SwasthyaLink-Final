"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { User, Building2, Phone, Award, LogOut, MapPin, Clock, Map } from "lucide-react"

export function ProfilePopup() {
  const { hospital, logout } = useAuth()

  if (!hospital) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all"
        >
          <User className="w-5 h-5 text-primary-foreground" />
          <span className="sr-only">Open profile</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 lg:w-96 p-0 shadow-2xl border-border/50" align="end">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-5 rounded-t-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-primary-foreground text-lg truncate">
                {hospital.hospital_name}
              </h3>
              <p className="text-sm text-primary-foreground/80">{hospital.full_name}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Specialization</p>
              <p className="text-sm font-medium text-foreground">{hospital.specialty}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium text-foreground">{hospital.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Area Zone</p>
              <p className="text-sm font-medium text-foreground">{hospital.area_zone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20">
            <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Operating Hours</p>
              <p className="text-sm font-medium text-secondary">{hospital.operating_hours}</p>
            </div>
          </div>
          
          {hospital.google_maps_link && (
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Map className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0 flex items-center">
                <a href={hospital.google_maps_link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-500 hover:underline">
                  View on Google Maps
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-border/50">
          <Button
            variant="destructive"
            className="w-full h-11 font-semibold rounded-xl"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
