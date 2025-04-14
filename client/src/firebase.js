// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBfr2_v7CbNBGYY9spRuM-sDpOS2nCL9jw",
  authDomain: "ml-driven-fraud-system.firebaseapp.com",
  projectId: "ml-driven-fraud-system",
  storageBucket: "ml-driven-fraud-system.firebasestorage.app",
  messagingSenderId: "430405613723",
  appId: "1:430405613723:web:dcd007fde275b75cb52e3e",
  measurementId: "G-B3MR5MNCQG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
