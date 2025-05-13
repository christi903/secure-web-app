import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserSession = async () => {
    const {
      data: { session },
      
    } = await supabase.auth.getSession();

    if (session?.user) {
      const user = session.user;
      if (user.email_confirmed_at) {
        setCurrentUser(user);
      } else {
        await supabase.auth.signOut();
        toast.info("Verification email sent. Please check your inbox.");
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    getUserSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        if (session.user.email_confirmed_at) {
          setCurrentUser(session.user);
        } else {
          await supabase.auth.signOut();
          toast.info("Verification email sent. Please check your inbox.");
          setCurrentUser(null);
        }
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
