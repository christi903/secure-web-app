import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload(); // Refresh the user object to get updated emailVerified status
        if (user.emailVerified) {
          setCurrentUser(user);
        } else {
          // Send verification email if not sent already
          try {
            await sendEmailVerification(user);
            toast.info("Verification email sent. Please check your inbox.");
          } catch (error) {
            console.error("Failed to send verification email:", error);
            toast.error("Failed to send verification email.");
          }

          // Log them out since they're unverified
          await signOut(auth);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ currentUser, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
