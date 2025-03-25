
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Classroom from "./pages/Classroom";
import Syllabus from "./pages/Syllabus";
import Course from "./pages/Course";
import ContentPage from "./pages/ContentPage";
import ReviseRoom from "./pages/ReviseRoom";
import TestRoom from "./pages/TestRoom";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";
import AuthLayout from "./components/AuthLayout";

const queryClient = new QueryClient();

const App = () => {
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
                <Route path="/sign-in" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <SignIn />} />
                <Route path="/sign-up" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <SignUp />} />
                
                {/* Protected routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/classroom" element={<Classroom />} />
                  <Route path="/classroom/syllabus/:id" element={<Syllabus />} />
                  <Route path="/classroom/course/:id" element={<Course />} />
                  <Route path="/classroom/:courseId/content/:chapterId" element={<ContentPage />} />
                  <Route path="/reviseroom" element={<ReviseRoom />} />
                  <Route path="/testroom" element={<TestRoom />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
