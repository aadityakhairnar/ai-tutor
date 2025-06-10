import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
