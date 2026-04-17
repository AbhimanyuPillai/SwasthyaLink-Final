import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
  doc
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Patient, MedicalRecord } from "./patient-context";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "slink");
export const storage = getStorage(app);

/**
 * Patient Logic Functions
 */

// 1. Search for a patient by their Swasthya ID OR Mobile Number AND fetch their records!
export const handlePatientLookup = async (searchTerm: string): Promise<Patient | null> => {
  try {
    const cleanTerm = searchTerm.trim();
    let q;

    // Detect if the input is a Swasthya ID (contains letters) or a Phone Number (all digits)
    if (isNaN(Number(cleanTerm.replace("+", "").replace("-", "").replace(/\s/g, "")))) {

      // SEARCH BY SWASTHYA ID
      const formattedId = cleanTerm.toUpperCase();
      console.log("Searching Firestore by swasthya_id:", formattedId);
      q = query(collection(db, "users"), where("swasthya_id", "==", formattedId));

    } else {

      // SEARCH BY MOBILE NUMBER (Format: +91 XXXXXXXXXX)
      // 1. Remove all spaces the doctor might have typed to get a clean raw number
      let rawNumber = cleanTerm.replace(/\s/g, '');

      let formattedPhone;
      if (rawNumber.startsWith("+91")) {
        // If it was "+919876543210", transform to "+91 9876543210"
        formattedPhone = `+91 ${rawNumber.substring(3)}`;
      } else if (rawNumber.length === 10) {
        // If it was "9876543210", transform to "+91 9876543210"
        formattedPhone = `+91 ${rawNumber}`;
      } else {
        formattedPhone = rawNumber; // Fallback for non-standard inputs
      }

      console.log("Searching Firestore by phone with space-format:", `"${formattedPhone}"`);
      q = query(collection(db, "users"), where("phone", "==", formattedPhone));
    }

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const patientDoc = querySnapshot.docs[0];
    const docData = patientDoc.data();

    // Fetch medical records from the 'medical_records' subcollection
    const recordsRef = collection(db, "users", patientDoc.id, "medical_records");
    const recordsSnapshot = await getDocs(recordsRef);

    const medicalHistory = recordsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MedicalRecord[];

    const calculateAge = (dobString: string) => {
      if (!dobString) return "N/A";
      const birthDate = new Date(dobString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    return {
      id: patientDoc.id,
      ...docData,
      name: docData.full_name || "Unknown Patient",
      swasthyaId: docData.swasthya_id,
      bloodGroup: docData.blood_group || "N/A",
      address: docData.location || "N/A",
      phoneNumber: docData.phone || "N/A",
      age: calculateAge(docData.dob),
      gender: docData.gender || "N/A",
      medicalHistory
    } as Patient;

  } catch (error) {
    console.error("Error looking up patient:", error);
    throw error;
  }
};

// 2. Add a new medical record to a specific patient's subcollection
export const addMedicalRecord = async (patientId: string, recordData: any) => {
  try {
    const recordsRef = collection(db, "users", patientId, "medical_records");
    return await addDoc(recordsRef, {
      ...recordData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding medical record:", error);
    throw error;
  }
};