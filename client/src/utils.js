import { db } from "./firebase"; // Firebase Firestore instance
import { doc, getDoc } from "firebase/firestore";

// Function to get user data from Firestore
export const getUserProfile = async (userId) => {
  const userDocRef = doc(db, "users", userId); // Assuming "users" collection in Firestore
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data(); // Return user data from Firestore
  } else {
    console.log("No such document!");
    return null;
  }
};
