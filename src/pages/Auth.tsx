
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AuthFields from "@/components/AuthFields";
import AuthError from "@/components/AuthError";

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

    if (variant === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate("/dashboard", { replace: true });
    } else {
      // Directly sign the user up and then log them in with no email confirmation step
      const { error: signupError } = await supabase.auth.signUp({ email, password });
      if (signupError) {
        setError(signupError.message);
      } else {
        // attempt auto login
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) setError("Signup complete, but auto-login failed. Please log in manually.");
        else navigate("/dashboard", { replace: true });
      }
    }
    setLoading(false);
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
      </div>
    </div>
  );
};

export default AuthPage;
