import { supabase } from "./supabaseClient"; // Supabase client

// Function to get user data from Supabase
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single(); // Return a single user

  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }

  return data;
};
