import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "./components/NavBar";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Classroom from "./pages/Classroom";
import Syllabus from "./pages/Syllabus";
import Course from "./pages/Course";
import ContentPage from "./pages/ContentPage";
import ReviseRoom from "./pages/ReviseRoom";
import TestRoom from "./pages/TestRoom";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { useStore } from "./store/useStore";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error initializing session:", error);
      }
      // The AuthProvider will handle setting the user state based on the session
    };

    initializeSession();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        // Load user courses when signed in
        useStore.getState().loadUserCourses();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Clear courses when signed out
        useStore.setState({ courses: [] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <div className="flex flex-col min-h-screen">
              <NavBar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/classroom" element={<Classroom />} />
                  <Route path="/classroom/syllabus/:id" element={<Syllabus />} />
                  <Route path="/classroom/course/:id" element={<Course />} />
                  <Route path="/classroom/:courseId/content/:chapterId" element={<ContentPage />} />
                  <Route path="/reviseroom" element={<ReviseRoom />} />
                  <Route path="/testroom" element={<TestRoom />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
