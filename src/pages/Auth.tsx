
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AuthFields from "@/components/AuthFields";
import AuthError from "@/components/AuthError";
import CreateTestUser from "@/components/CreateTestUser";

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/dashboard", { replace: true });
      }
    });
  }, [navigate]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // For debugging
    console.log(`Attempting to ${variant} with email: ${email.trim()}`);

    try {
      if (variant === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        
        if (error) {
          console.error("Login error:", error.message);
          setError(error.message);
        } else if (data.user) {
          console.log("Login successful:", data.user.id);
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in."
          });
          navigate("/dashboard", { replace: true });
        }
      } else {
        // For signup flow
        const { data: signupData, error: signupError } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              email: email.trim(),
            }
          } 
        });
        
        if (signupError) {
          console.error("Signup error:", signupError.message);
          setError(signupError.message);
        } else if (signupData.user) {
          console.log("Signup successful:", signupData.user.id);
          
          // Auto login after signup
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
            email: email.trim(), 
            password 
          });
          
          if (loginError) {
            console.error("Auto-login error:", loginError.message);
            setError("Signup complete, but auto-login failed. Please log in manually.");
          } else if (loginData.user) {
            console.log("Auto-login successful after signup");
            toast({
              title: "Account created!",
              description: "You've successfully signed up and logged in."
            });
            navigate("/dashboard", { replace: true });
          }
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {variant === "login" ? "Sign In" : "Sign Up"}
        </h1>
        <form onSubmit={handleAuth} className="space-y-6">
          <AuthFields
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            variant={variant}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? variant === "login"
                ? "Logging in..."
                : "Signing up..."
              : variant === "login"
              ? "Log In"
              : "Sign Up"}
          </Button>
        </form>
        <AuthError error={error} />
        <div className="mt-6 text-center text-sm">
          {variant === "login" ? (
            <>
              New here?{" "}
              <button
                className="underline"
                onClick={() => setVariant("signup")}
                disabled={loading}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="underline"
                onClick={() => setVariant("login")}
                disabled={loading}
              >
                Log In
              </button>
            </>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t text-xs text-center text-muted-foreground">
          <p>Test credentials:</p>
          <p>Email: test@example.com</p>
          <p>Password: Test12345!</p>
        </div>
        
        <CreateTestUser />
      </div>
    </div>
  );
};

export default AuthPage;
