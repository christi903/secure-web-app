import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // Import Firestore
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfr2_v7CbNBGYY9spRuM-sDpOS2nCL9jw",
  authDomain: "ml-driven-fraud-system.firebaseapp.com",
  projectId: "ml-driven-fraud-system",
  storageBucket: "ml-driven-fraud-system.appspot.com",
  messagingSenderId: "430405613723",
  appId: "1:430405613723:web:dcd007fde275b75cb52e3e",
  measurementId: "G-B3MR5MNCQG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firebase services you need
export const auth = getAuth(app); // Authentication
export const db = getFirestore(app); // Firestore instance
export const storage = getStorage(app); // Storage

// Helper to get a fresh Firebase ID Token (for secure API calls)
export const getFreshIdToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is currently logged in.");
  }
  const token = await user.getIdToken(true); // `true` forces a refresh
  return token;
};
