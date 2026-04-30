"use client"

import { useState, useRef, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { QrCode, AlertCircle, CheckCircle2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Button } from "@/components/ui/button"

export function QRScanner({ onPatientFound }: any) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "found" | "error">("idle")
  const [cameraError, setCameraError] = useState("")
  const qrReaderRef = useRef<Html5Qrcode | null>(null)

  // Inside qr-scanner.tsx
  const handlePatientLookup = async (scannedText: string) => {
    try {
      setScanStatus("scanning");
      const usersRef = collection(db, "users");

      // Use 'swasthya_id' to match your database
      const q = query(usersRef, where("swasthya_id", "==", scannedText));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData: any = { id: userDoc.id, ...userDoc.data() };

        // Fetch the 'medical_records' subcollection
        const recordsRef = collection(db, "users", userDoc.id, "medical_records");
        const recordsSnapshot = await getDocs(recordsRef);

        userData.medical_records = recordsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setScanStatus("found");

        // Send the complete object to the dashboard
        if (onPatientFound) onPatientFound(userData);
      } else {
        setScanStatus("error");
        setCameraError(`Patient ID ${scannedText} not found.`);
      }
    } catch (err) {
      setScanStatus("error");
      console.error("QR Fetch Error:", err);
    }
  }

  const stopScanner = async () => {
    if (qrReaderRef.current && qrReaderRef.current.isScanning) {
      try {
        await qrReaderRef.current.stop()
        qrReaderRef.current.clear()
      } catch (e) { console.error("Stop error:", e) }
    }
    setIsScanning(false)
  }

  const handleStartScan = async () => {
    setCameraError("")
    setScanStatus("scanning")
    try {
      const qrReader = new Html5Qrcode("qr-reader-viewport")
      qrReaderRef.current = qrReader
      setIsScanning(true)

      await qrReader.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopScanner()
          handlePatientLookup(decodedText)
        },
        () => { /* Ignore frame errors */ }
      )
    } catch (error) {
      setCameraError("Camera access denied. Please check permissions.")
      setIsScanning(false)
    }
  }

  // Cleanup camera if user leaves the component
  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="relative aspect-square bg-gray-900 flex items-center justify-center">
          <div id="qr-reader-viewport" className="w-full h-full"></div>

          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900/80">
              <QrCode className="w-16 h-16 mb-4 opacity-50" />
              <Button
                onClick={handleStartScan}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Camera Scan
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 text-center">
          {cameraError && <p className="text-red-500 flex items-center justify-center gap-2"><AlertCircle size={16} /> {cameraError}</p>}
          {scanStatus === "found" && <p className="text-green-600 flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Patient Found!</p>}
        </div>
      </div>
    </div>
  )
}