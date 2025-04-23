
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Classroom from "./pages/Classroom";
import Syllabus from "./pages/Syllabus";
import Course from "./pages/Course";
import ContentPage from "./pages/ContentPage";
import ReviseRoom from "./pages/ReviseRoom";
import TestRoom from "./pages/TestRoom";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import { useStore } from "./store/useStore";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function AuthLoader() {
  const setSession = useStore(s => s.setSession);
  useEffect(() => {
    // Listen for session changes (set up *before* getting session)
    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null)
    });
    return () => subscription.unsubscribe();
  }, [setSession]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthLoader />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <main className="flex-grow">
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/classroom" element={<Classroom />} />
              <Route path="/classroom/syllabus/:id" element={<Syllabus />} />
              <Route path="/classroom/course/:id" element={<Course />} />
              <Route path="/classroom/:courseId/content/:chapterId" element={<ContentPage />} />
              <Route path="/reviseroom" element={<ReviseRoom />} />
              <Route path="/testroom" element={<TestRoom />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
