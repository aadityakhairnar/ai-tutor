
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { supabase } from "@/integrations/supabase/client";

const AuthLoader = () => {
  const setSession = useStore(s => s.setSession);

  useEffect(() => {
    // Listen for session changes (set up *before* getting session)
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
    });
    return () => data.subscription?.unsubscribe();
  }, [setSession]);
  return null;
};

export default AuthLoader;
