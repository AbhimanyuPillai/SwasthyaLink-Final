"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icon in Leaflet + Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPickerProps {
  position: [number, number]
  setPosition: (pos: [number, number]) => void
}

function LocationMarker({ position, setPosition }: MapPickerProps) {
  const map = useMap()
  
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  // We need to re-center the map when the position changes from outside (e.g. Geolocation)
  useEffect(() => {
    map.flyTo(position, map.getZoom())
  }, [position, map])

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

export default function MapPicker({ position, setPosition }: MapPickerProps) {
  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      scrollWheelZoom={true} 
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  )
}
