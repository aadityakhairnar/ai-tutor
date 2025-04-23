
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        alert("Signup successful! You can now log in.");
        setVariant("login");
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
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={variant === "login" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
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
        {error && <div className="mt-3 text-red-500 text-sm text-center">{error}</div>}
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

