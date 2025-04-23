
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AuthFields from "@/components/AuthFields";
import AuthError from "@/components/AuthError";

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

    try {
      if (variant === "login") {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        
        if (error) {
          console.error("Login error:", error.message);
          setError(error.message);
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully logged in."
          });
          navigate("/dashboard", { replace: true });
        }
      } else {
        const { error: signupError } = await supabase.auth.signUp({ 
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
        } else {
          // Auto login after signup
          const { error: loginError } = await supabase.auth.signInWithPassword({ 
            email: email.trim(), 
            password 
          });
          
          if (loginError) {
            setError("Signup complete, but auto-login failed. Please log in manually.");
          } else {
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
          <p>Email: user@testapp.com</p>
          <p>Password: UserTest456!</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
