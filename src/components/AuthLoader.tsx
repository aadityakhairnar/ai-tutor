
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { supabase } from "@/integrations/supabase/client";

const AuthLoader = () => {
  const setSession = useStore(s => s.setSession);

  useEffect(() => {
    console.log("AuthLoader: Initializing auth state");
    
    // Listen for auth state changes (set up *before* getting session)
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`, session ? "User logged in" : "No session");
      setSession(session);
    });
    
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      console.log("Initial session check:", data.session ? "Session found" : "No session");
      setSession(data.session || null);
    });
    
    // Clean up subscription on unmount
    return () => {
      console.log("AuthLoader: Cleaning up auth subscription");
      data.subscription.unsubscribe();
    };
  }, [setSession]);
  
  return null;
};

export default AuthLoader;
